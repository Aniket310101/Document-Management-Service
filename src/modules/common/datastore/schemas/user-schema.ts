import { v4 as uuidv4 } from 'uuid';

const userSchema = {
    _id: { type: String, default: uuidv4 },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
};

export default userSchema;