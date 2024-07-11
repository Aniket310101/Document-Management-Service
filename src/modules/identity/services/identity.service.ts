import AuthTokenModel from '../../common/models/auth-token-model';
import JwtHelper from '../../common/helpers/jwt.helper';
import ErrorHandler from '../../common/errors/error-handler';
import { ErrorCodeEnums } from '../../common/errors/error.enums';
import BcryptHelper from '../../common/helpers/bcrypt.helper';
import AccessTokenModel from '../models/access-token.model';
import UserModel from '../models/user.model';
import { userSigninRequestPayload } from '../payloads/user-signin.request.payload';
import { userSignupRequestPayload } from '../payloads/user-signup.request.payload';
import AccessTokenRepository from '../repositories/access-token.repository';
import IdentityRepository from '../repositories/identity.repository';

export default class IdentityService {
    async signupUser(payload: typeof userSignupRequestPayload): Promise<UserModel> {
        const user = new UserModel(payload);
        const hashedPassword = await new BcryptHelper().hashString(user.password as string);
        user.password = hashedPassword;
        const result: UserModel = await new IdentityRepository().insertUser(user);
        return result;
    }

    async signinUser(payload: typeof userSigninRequestPayload): Promise<string> {
        const user = new UserModel(payload);
        const {username, password} = user;
        const userInfo: UserModel = await this.getUserInfoByUsername(username);
        if (!userInfo) throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, 'No User with this username exists!');
        const isPasswordCorrect = await new BcryptHelper().compare(password, userInfo.password);
        if (!isPasswordCorrect) throw new ErrorHandler(ErrorCodeEnums.UNAUTHORIZED, 'Incorrect Password!');
        const newAccessToken = new JwtHelper().generateAccessTokens(new AuthTokenModel(userInfo));
        const {token} = await this.storeUserAccessToken(newAccessToken, userInfo);
        return token;
    }

    private async getUserInfoByUsername(username: string): Promise<UserModel> {
        const userInfo: UserModel = await new IdentityRepository().getUserByUsername(username);
        return userInfo;
    }

    private async storeUserAccessToken(token: string, userInfo: UserModel): Promise<AccessTokenModel> {
        const accessTokenData: AccessTokenModel = {
            userID: userInfo.id,
            token
        };
        const accessTokenMetaData = await new AccessTokenRepository().insertUserAccessToken(accessTokenData);
        return accessTokenMetaData;
    }
 }