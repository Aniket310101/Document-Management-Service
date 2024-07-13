import mongoose, { Model } from 'mongoose';
import BaseDatastore from '../../common/datastore/base-datastore';
import ErrorHandler from '../../common/errors/error-handler';
import { ErrorCodeEnums } from '../../common/errors/error.enums';
// import UserModel from '../models/user.model';
import AccessTokenModel from '../models/access-token.model';
import userAccessTokensSchema from '../../common/datastore/schemas/user-access-tokens.schema';


export default class AccessTokenRepository extends BaseDatastore {
  private dbInstance: mongoose.Model<typeof userAccessTokensSchema>;

  constructor() {
    super();
    this.dbInstance = BaseDatastore.UserAccessTokensDB
      ? BaseDatastore.UserAccessTokensDB
      : undefined;
    if (!this.dbInstance)
      throw new ErrorHandler(
        ErrorCodeEnums.INTERNAL_SERVER_ERROR,
        'DB Issue in user_access_tokens Collection!',
      );
  }
  async insertUserAccessToken(
    accessTokenMetaData: AccessTokenModel,
  ): Promise<AccessTokenModel> {
    let dbAccessToken;
    try {
      dbAccessToken = await new this.dbInstance(accessTokenMetaData).save();
    } catch (err) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
    }
    const accessTokenInfo = new AccessTokenModel(dbAccessToken);
    return accessTokenInfo;
  }

  async getAccessTokenMetaData(
    token: string,
  ): Promise<AccessTokenModel | undefined> {
    let dbAccessToken;
    try {
      dbAccessToken = await this.dbInstance.findOne({ token });
    } catch (err) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
    }
    const accessTokenMetaData = dbAccessToken
      ? new AccessTokenModel(dbAccessToken)
      : undefined;
    return accessTokenMetaData;
  }

  async expireAccessToken(
    userID: string,
    token: string,
  ): Promise<string> {
    let dbAccessToken;
    let message: string;
    try {
      dbAccessToken = await this.dbInstance.deleteOne({$and: [{userID}, { token }]});
      message = 'User logged out successfully!';
    } catch (err) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
    }
    return message;
  }

  async expireAllAccessToken(
    userID: string,
  ): Promise<string> {
    let dbAccessToken;
    let message: string;
    try {
      dbAccessToken = await this.dbInstance.deleteMany({userID});
      message = 'User logged out from all devices!';
    } catch (err) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
    }
    return message;
  }
}
