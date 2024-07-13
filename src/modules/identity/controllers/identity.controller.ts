import { NextFunction, Request, Response } from 'express';
import { userSignupRequestPayload } from '../payloads/user-signup.request.payload';
import JoiValidation from '../../common/joi-validation/joi-validation';
import IdentityService from '../services/identity.service';
import { userSigninRequestPayload } from '../payloads/user-signin.request.payload';
import JwtHelper from '../../common/helpers/jwt.helper';

export default class IdentityController {
  async signupUser(req: Request, res: Response, next: NextFunction) {
    const payload: typeof userSignupRequestPayload =
      new JoiValidation().extractAndValidate<typeof userSignupRequestPayload>(
        req.body,
        userSignupRequestPayload,
      );
    const result = await new IdentityService().signupUser(payload);
    res.send(result);
  }

  async signinUser(req: Request, res: Response, next: NextFunction) {
    const payload: typeof userSigninRequestPayload =
      new JoiValidation().extractAndValidate<typeof userSigninRequestPayload>(
        req.body,
        userSigninRequestPayload,
      );
    const token = await new IdentityService().signinUser(payload);
    res.send({ token });
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const jwtHelper = new JwtHelper();
    const token = jwtHelper.extractTokenFromHeader(req.headers.authorization);
    const message = await new IdentityService().logoutUser(token);
    res.send({ message });
  }

  async singleSignOut(req: Request, res: Response, next: NextFunction) {
    const jwtHelper = new JwtHelper();
    const token = jwtHelper.extractTokenFromHeader(req.headers.authorization);
    const message = await new IdentityService().singleSignOut(token);
    res.send({ message });
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    const userID = req.params.id as string;
    const isActive = (req.query.active as string).toLowerCase() === 'false' ? false : true;
    await new IdentityService().updateUserStatus(userID, isActive);
    res.status(204).send();
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const jwtHelper = new JwtHelper();
    const userID = req.params.id as string;
    const token = jwtHelper.extractTokenFromHeader(req.headers.authorization);
    await new IdentityService().deleteUser(userID, token);
    res.status(204).send();
  }

  async testMiddleware(req: Request, res: Response, next: NextFunction) {
    const jwtHelper = new JwtHelper();
    const token = jwtHelper.extractTokenFromHeader(req.headers.authorization);
    const decodedToken = jwtHelper.decode(token);
    res.send({ user: decodedToken, message: 'Test Successful!' });
  }
}
