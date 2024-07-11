import { NextFunction } from 'express';
import * as Express from 'express';
import ErrorHandler from '../errors/error-handler';
import { ErrorCodeEnums } from '../errors/error.enums';
import AccessTokenRepository from '../../identity/repositories/access-token.repository';
import JwtHelper from '../helpers/jwt.helper';

export default class AuthMiddleware {
    async verify(
        req: Express.Request,
        res: Express.Response,
        next: NextFunction,
    ) {
        const bearerHeader = req.headers.authorization;
        if (!bearerHeader) throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, 'Missing or Invalid Token!');
        const token = bearerHeader.split(' ')[1];
        // Check token expiration
        const isValidToken = await new AccessTokenRepository().getAccessTokenMetaData(token);
        if (!isValidToken)  {
            throw new ErrorHandler(ErrorCodeEnums.TEMPORARY_REDIRECT, 'Login required!');
        }
        // Verify Token
        new JwtHelper().verifyAccessToken(token);
        next();
    }

    async isValidToken(token: string): Promise<boolean> {
        const tokenMetaData = await new AccessTokenRepository().getAccessTokenMetaData(token);
        if (!tokenMetaData) return false;
        return true;
    }
}