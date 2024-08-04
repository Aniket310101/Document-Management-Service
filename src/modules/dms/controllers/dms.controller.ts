import { NextFunction, Request, Response } from 'express';
import DmsService from '../services/dms.service';
import S3UploadResponseModel from '../../common/models/s3-upload-response.model';

export default class DmsController {
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    const result: S3UploadResponseModel = await new DmsService().uploadFile(req.file);
    res.send(result);
  }

  async getSignedS3Url(req: Request, res: Response, next: NextFunction) {
    const fileKey: string = req.params.fileKey;
    const url = await new DmsService().getSignedS3Url(fileKey);
    res.send({url});
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    const fileKey: string = req.params.fileKey;
    await new DmsService().deleteFile(fileKey);
    res.status(204).send();
  }
}
