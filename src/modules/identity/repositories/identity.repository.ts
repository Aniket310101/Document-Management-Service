import mongoose, { Model } from 'mongoose';
import BaseDatastore from '../../common/datastore/base-datastore';
import ErrorHandler from '../../common/errors/error-handler';
import { ErrorCodeEnums } from '../../common/errors/error.enums';
import UserModel from '../models/user.model';
import userSchema from '../../common/datastore/schemas/user-schema';

export default class IdentityRepository extends BaseDatastore {
  private dbInstance: mongoose.Model<typeof userSchema>;

  constructor() {
    super();
    this.dbInstance = BaseDatastore.UsersDB
      ? BaseDatastore.UsersDB
      : undefined;
    if (!this.dbInstance)
      throw new ErrorHandler(
        ErrorCodeEnums.INTERNAL_SERVER_ERROR,
        'DB Issue in users Collection!',
      );
  }

  async insertUser(user: UserModel): Promise<UserModel> {
    let dbUser;
    try {
      dbUser = await new this.dbInstance(user).save();
    } catch (err) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
    }
    const userModel = new UserModel(dbUser);
    return userModel;
  }

  async getUserByUsername(username: string): Promise<UserModel | undefined> {
    let dbUser;
    try {
      dbUser = await this.dbInstance.findOne({$and: [{ username }, {isActive: true}]});
    } catch (err) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
    }
    const userModel = dbUser ? new UserModel(dbUser) : undefined;
    return userModel;
  }

  async updateUserById(userID: string, updatedDoc: UserModel): Promise<UserModel | undefined> {
    let result;
    try {
      result = await this.dbInstance.updateOne({_id: userID}, {$set: updatedDoc});
      if (result.matchedCount === 0) {
        throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, 'No user found with the given ID.');
      }
    } catch (err) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
    }
    const userModel = result ? new UserModel(result) : undefined;
    return userModel;
  }

  async deleteUser(
    userID: string,
  ): Promise<string> {
    let dbAccessToken;
    let message: string;
    try {
      dbAccessToken = await this.dbInstance.deleteOne({_id: userID});
      message = 'User account deleted!';
    } catch (err) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
    }
    return message;
  }
}
