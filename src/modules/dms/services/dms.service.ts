import AwsS3Provider from '../../common/aws-s3/aws-s3-provider';
import S3UploadResponseModel from '../../common/models/s3-upload-response.model';

export default class DmsService {
    async uploadFile(file: Express.Multer.File): Promise<S3UploadResponseModel> {
        const uploadedFileData = await new AwsS3Provider().uploadFile(file);
        const fileMetaData: S3UploadResponseModel = new S3UploadResponseModel({...file, ...uploadedFileData});
        return fileMetaData;
    }

    async getSignedS3Url(fileKey: string): Promise<string> {
        const url = await new AwsS3Provider().getSignedS3Url(fileKey);
        return url;
    }

    async deleteFile(fileKey: string): Promise<void> {
        await new AwsS3Provider().deleteFile(fileKey);
    }
}