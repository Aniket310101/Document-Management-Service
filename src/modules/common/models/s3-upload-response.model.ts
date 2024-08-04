export default class S3UploadResponseModel {
    fileKey: string;
    url: string;
    fileName: string;
    size: number;
    mimetype: string;

    constructor(data: any) {
        this.fileKey = data.fileKey; 
        this.url = data.url;
        this.fileName = data.originalname;
        this.size = data.size;
        this.mimetype = data.mimetype;
    }
}