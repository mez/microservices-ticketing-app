import mongoose from "mongoose";
import {Password} from '../utils/password'

interface UserAttributes {
    email: string;
    password: string;
}

interface UserModel extends mongoose.Model<UserDocument> {
    build(attributes: UserAttributes): UserDocument;
}

interface UserDocument extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password
            ret.id = doc._id
            delete ret._id
        },
        versionKey: false
    }
});

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.hash(this.get('password'))        
        this.set('password', hashed) 
    }

     
    done()
})

userSchema.statics.build = (attributes: UserAttributes) => {
    return new User(attributes)
}

const User = mongoose.model<UserDocument, UserModel>('User', userSchema)


export { User }