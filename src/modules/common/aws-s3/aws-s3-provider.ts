import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ErrorHandler from '../errors/error-handler';
import { ErrorCodeEnums } from '../errors/error.enums';
import { v4 as uuidv4 } from 'uuid';


export default class AwsS3Provider {
    static s3: S3Client;

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

    async uploadFile(file: Express.Multer.File): Promise<{url: string, fileKey: string}> {
        const fileKey: string = uuidv4();
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        const command = new PutObjectCommand(params);
        try {
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
        const command = new GetObjectCommand(params);
        let url: string;
        try {
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
        const command = new DeleteObjectCommand(params);
        try {
            await AwsS3Provider.s3.send(command);
        } catch (e) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Error while deleting file from S3! ${e}`);
        }
    }

    private generateCloudfrontUrl(fileKey: string): string {
        const url  = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${fileKey}`;
        return url;
    }
}