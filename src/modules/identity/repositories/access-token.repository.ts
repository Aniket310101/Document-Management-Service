import mongoose, { Model } from 'mongoose';
import BaseDatastore from '../../common/datastore/base-datastore';
import ErrorHandler from '../../common/errors/error-handler';
import { ErrorCodeEnums } from '../../common/errors/error.enums';
// import UserModel from '../models/user.model';
import AccessTokenModel from '../models/access-token.model';

export default class AccessTokenRepository extends BaseDatastore {
    async insertUserAccessToken(accessTokenMetaData: AccessTokenModel): Promise<AccessTokenModel> {
        let dbAccessToken;
        const dbInstance = BaseDatastore.UserAccessTokensDB 
            ? new BaseDatastore.UserAccessTokensDB(accessTokenMetaData) 
            : undefined;
        if (!dbInstance) throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'DB Issue in user_access_tokens Collection!');
        try {
            dbAccessToken = await dbInstance.save();
        } catch(err) {
            throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
        }
        const accessTokenInfo = new AccessTokenModel(dbAccessToken);
        return accessTokenInfo;  
    }

    async getAccessTokenMetaData(token: string): Promise<AccessTokenModel | undefined> {
        let dbAccessToken;
        const dbInstance = BaseDatastore.UserAccessTokensDB 
            ? BaseDatastore.UserAccessTokensDB
            : undefined;
        if (!dbInstance) throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'DB Issue in user_access_tokens Collection!');
        try {
            dbAccessToken = await dbInstance.findOne({token});
        } catch(err) {
            throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
        }
        const accessTokenMetaData = dbAccessToken ? new AccessTokenModel(dbAccessToken) : undefined;
        return accessTokenMetaData;  
    }
}