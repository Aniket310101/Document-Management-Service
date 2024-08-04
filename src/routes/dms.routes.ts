import { Router } from 'express';
import { asyncHandler } from '../modules/common/errors/async-handler';
import multer from 'multer';
import AuthMiddleware from '../modules/common/auth/auth.middleware';
import DmsController from '../modules/dms/controllers/dms.controller';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const dmsRouter = Router();
const dmsController = new DmsController();

dmsRouter.post('/', upload.single('file'), asyncHandler(dmsController.uploadFile));
dmsRouter.get('/:fileKey', asyncHandler(dmsController.getSignedS3Url));
dmsRouter.delete('/:fileKey', asyncHandler(dmsController.deleteFile));

export default dmsRouter;