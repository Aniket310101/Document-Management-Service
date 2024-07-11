import bcrypt from 'bcrypt';


export default class BcryptHelper {
    async hashString(text: string, saltRounds: number = 10): Promise<string> {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(text, salt);
        return hash;
    }

    async compare(plainText: string, hash: string): Promise<boolean> {
        const match = await bcrypt.compare(plainText, hash);
        return match;
    }
}