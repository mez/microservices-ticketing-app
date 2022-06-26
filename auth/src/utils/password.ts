import bcrypt from 'bcryptjs'

export class Password {
    static async hash(password: string) {

        const salt = await bcrypt.genSalt(10);
        if (!salt) throw Error('Something went wrong with password hashing');

        const hash = await bcrypt.hash(password, salt);
        if (!hash) throw Error('Something went wrong hashing the password');
        
        return hash;
    }

    static async compare(hashedPassword:string, suppliedPassword: string) {
        return await bcrypt.compare(suppliedPassword, hashedPassword)
    }

}