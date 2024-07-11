import mongoose, { Schema } from 'mongoose';
import ErrorHandler from '../errors/error-handler';
import { ErrorCodeEnums } from '../errors/error.enums';
import userSchema from './schemas/user-schema';
import userAccessTokensSchema from './schemas/user-access-tokens.schema';

export default class BaseDatastore {

    static UsersDB: mongoose.Model<typeof userSchema>;
    static UserAccessTokensDB: mongoose.Model<typeof userAccessTokensSchema>;

    async initializeDB() {
        const dbUrl: string = process.env.DB_URL as string;
        // Connection to DB
        try {
            await mongoose.connect(dbUrl);
            console.log('Connected to DB!');
        } catch (err) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Could Not Connect to DB!');
        }
        // Initialize DB models
        try {
            await this.initializeDBModels();
            console.log('DB models initialized!');
        } catch (err) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in intializing DB models!');
        }
    }

    private async initializeDBModels() {
        BaseDatastore.UsersDB = mongoose.model<typeof userSchema>(
            'users', new Schema(userSchema, {timestamps: true, _id: true, id: true})
        );
        BaseDatastore.UserAccessTokensDB = mongoose.model<typeof userAccessTokensSchema>(
            'user_access_Tokens', new Schema(userAccessTokensSchema, {timestamps: true, _id: true, id: true})
        );
    } 
}