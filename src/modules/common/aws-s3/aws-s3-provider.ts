import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ErrorHandler from '../errors/error-handler';
import { ErrorCodeEnums } from '../errors/error.enums';
import { v4 as uuidv4 } from 'uuid';


export default class AwsS3Provider {
    static s3: S3Client;

    static cloufront: CloudFrontClient;

    async initialize() {
        await this.initializeS3();
        await this.initializeCloudfront();
    }

    async initializeS3() {
        try {
            AwsS3Provider.s3 = new S3Client({
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
                region: process.env.S3_BUCKET_REGION,
            });
        } catch (e) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Could Not Connect to AWS S3!');
        }
        console.log('Connected to AWS S3!');
    }

    async initializeCloudfront() {
        try {
            AwsS3Provider.cloufront = new CloudFrontClient({
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
                region: 'Global'
            });
        } catch (e) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Could Not Connect to AWS CDN!');
        }
        console.log('Connected to AWS CDN!');
    }

    async uploadFile(file: Express.Multer.File): Promise<{url: string, fileKey: string}> {
        const fileKey: string = uuidv4();
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        try {
            const command = new PutObjectCommand(params);
            await AwsS3Provider.s3.send(command);
        } catch (e) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Error while uploading file to S3! ${e}`);
        }
        const cfUrl = this.generateCloudfrontUrl(fileKey);
        return {url: cfUrl, fileKey};
    }

    // Using Multipart Upload (Parallel read and upload in chunks. Faster Upload)
    async uploadFileMultipart(file: Express.Multer.File): Promise<{ url: string, fileKey: string }> {
        const fileKey: string = uuidv4();
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            const upload = new Upload({
                client: AwsS3Provider.s3,
                params: params,
                leavePartsOnError: false, // if upload fails then clears the uploaded chunks
                partSize: 5 * 1024 * 1024, // Adjust part size (e.g., 5MB)
                queueSize: 10, // Adjust concurrency level
            });
            await upload.done();
        } catch (e) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Error while uploading file to S3! ${e}`);
        }

        const cfUrl = this.generateCloudfrontUrl(fileKey);
        return { url: cfUrl, fileKey };
    }

    async getSignedS3Url(fileKey: string): Promise<string> {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
        };
        let url: string;
        try {
            const command = new GetObjectCommand(params);
            // Expires in 3600 secs
            url = await getSignedUrl(AwsS3Provider.s3, command, {expiresIn: 3600});
        } catch (e) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Error while fetching signed URL from S3! ${e}`);
        }
        return url;
    }

    async deleteFile(fileKey: string): Promise<void> {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
        };
        try {
            const command = new DeleteObjectCommand(params);
            await AwsS3Provider.s3.send(command);
            await this.invalidateCloufrontCache(fileKey); // Invalidate Cloudfront cache
        } catch (e) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Error while deleting file from S3! ${e}`);
        }
    }

    // Invalidate Cloudfront Cache upon deleting file from S3
    async invalidateCloufrontCache(fileKey: string): Promise<void> {
        const invalidationParams = {
            DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
            InvalidationBatch: {
                CallerReference: fileKey,
                Paths: {
                    Quantity: 1,
                    Items: [
                        `/${fileKey}`
                    ],
                },
            },
        };
        try {
            const command = new CreateInvalidationCommand(invalidationParams);
            await AwsS3Provider.cloufront.send(command);
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Error while invalidating CDN cache! ${error}`);
        }
    }

    private generateCloudfrontUrl(fileKey: string): string {
        const url  = `${process.env.AWS_CLOUDFRONT_DOMAIN}/${fileKey}`;
        return url;
    }
}