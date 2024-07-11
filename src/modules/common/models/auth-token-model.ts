export default class AuthTokenModel {
    id: string;
    username: string;
    email: string;

    constructor(data: any) {
        this.id = data.id ?? data._id; 
        this.username = data.username;
        this.email = data.email;
    }
}