export interface accessTokenInterface {
    id: string;
    _id: string;
    userID: string;
    token: string;
    isExpired: boolean;
    createdAt: Date;
    updatedAt: Date;
}