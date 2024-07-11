import ErrorHandler from '../errors/error-handler';
import { ErrorCodeEnums } from '../errors/error.enums';
import AuthTokenModel from '../models/auth-token-model';
import jwt from 'jsonwebtoken';

export default class JwtHelper {
    generateAccessTokens(payload: AuthTokenModel): string {
        const secret: string = process.env.JWT_TOKEN_SECRET as string; 
        return jwt.sign({ payload }, secret);
    }

    verifyAccessToken(token: string) {
        try {
            jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.UNAUTHORIZED, 'Invalid Token!');
        }
    }

    decode(token: string): AuthTokenModel {
        let user: AuthTokenModel;
        try {
            const tokenData: any = jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
            user = new AuthTokenModel(tokenData.payload);
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.UNAUTHORIZED, 'Invalid Token!');
        }
        return user;
    }

    extractTokenFromHeader(bearerHeader: string): string {
        if (!bearerHeader) throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, 'Missing or Invalid Token!');
        const token = bearerHeader.split(' ')[1];
        return token;
    }
}