import { accessTokenInterface } from '../utils/identity-interfaces.utils';

export default class AccessTokenModel {
    id?: string;
    userID?: string;
    token?: string;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: any) {
        this.id = data.id ?? data._id; 
        this.userID = data.userID;
        this.token = data.token;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}