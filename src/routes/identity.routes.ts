import { Router } from 'express';
import IdentityController from '../modules/identity/controllers/identity.controller';
import { asyncHandler } from '../modules/common/errors/async-handler';
import AuthMiddleware from '../modules/common/auth/auth.middleware';

const identityRouter = Router();
const identityController = new IdentityController();

identityRouter.post('/signup', asyncHandler(identityController.signupUser));
identityRouter.post('/signin', asyncHandler(identityController.signinUser));
identityRouter.get('/test', asyncHandler(new AuthMiddleware().verify), asyncHandler(identityController.testMiddleware));

export default identityRouter;
