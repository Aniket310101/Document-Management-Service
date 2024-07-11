import { v4 as uuidv4 } from 'uuid';

const userAccessTokensSchema = {
    _id: { type: String, default: uuidv4 },
    userID: { type: String, required: true },
    token: { type: String, required: true, unique: true },
};

export default userAccessTokensSchema;