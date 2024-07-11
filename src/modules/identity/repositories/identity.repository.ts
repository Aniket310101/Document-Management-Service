import mongoose, { Model } from 'mongoose';
import BaseDatastore from '../../common/datastore/base-datastore';
import ErrorHandler from '../../common/errors/error-handler';
import { ErrorCodeEnums } from '../../common/errors/error.enums';
import UserModel from '../models/user.model';

export default class IdentityRepository extends BaseDatastore {
    async insertUser(user: UserModel): Promise<UserModel> {
        let dbUser;
        const dbInstance = BaseDatastore.UsersDB 
            ? new BaseDatastore.UsersDB(user) 
            : undefined;
        if (!dbInstance) throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'DB Issue in User Collection!');
        try {
            dbUser = await dbInstance.save();
        } catch(err) {
            throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
        }
        const userModel = new UserModel(dbUser);
        return userModel;  
    }

    async getUserByUsername(username: string): Promise<UserModel | undefined> {
        let dbUser;
        const dbInstance = BaseDatastore.UsersDB 
            ? BaseDatastore.UsersDB
            : undefined;
        if (!dbInstance) throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'DB Issue in User Collection!');
        try {
            dbUser = await dbInstance.findOne({username});
        } catch(err) {
            throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, err as string);
        }
        const userModel = dbUser ? new UserModel(dbUser) : undefined;
        return userModel;  
    }
}