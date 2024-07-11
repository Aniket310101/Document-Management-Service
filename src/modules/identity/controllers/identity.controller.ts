import { NextFunction, Request, Response } from 'express';
import { userSignupRequestPayload } from '../payloads/user-signup.request.payload';
import JoiValidation from '../../common/joi-validation/joi-validation';
import IdentityService from '../services/identity.service';
import { userSigninRequestPayload } from '../payloads/user-signin.request.payload';
import JwtHelper from '../../common/helpers/jwt.helper';

export default class IdentityController {
    async signupUser(req: Request, res: Response, next: NextFunction) {
        const payload: typeof userSignupRequestPayload =
        new JoiValidation().extractAndValidate<typeof userSignupRequestPayload>(req.body, userSignupRequestPayload);
        const result = await new IdentityService().signupUser(payload);
        res.send(result);
    }

    async signinUser(req: Request, res: Response, next: NextFunction) {
        const payload: typeof userSigninRequestPayload =
        new JoiValidation().extractAndValidate<typeof userSigninRequestPayload>(req.body, userSigninRequestPayload);
        const token = await new IdentityService().signinUser(payload);
        res.send({token});
    }

    async testMiddleware(req: Request, res: Response, next: NextFunction) {
        const jwtHelper = new JwtHelper();
        const token = jwtHelper.extractTokenFromHeader(req.headers.authorization);
        const decodedToken = jwtHelper.decode(token);
        res.send({user: decodedToken, message: 'Test Successful!'});
    }
}