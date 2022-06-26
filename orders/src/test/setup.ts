import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: () => string[]
}

global.signin = () => {
    // build a jwt payload {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }
    
    //create jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!);    

    //build a session object {jwt: jwt_payload}
    const session = { jwt: token};

    // turn session into JSON
    const sessionJson = JSON.stringify(session);

    //take json and convert to base64
    const base64 = Buffer.from(sessionJson).toString('base64');

    // return a string thats the cookie with encoded data
    // 'session=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall5TnpaaVl6VXpZbUptTldVMFpEUTNZekZrTWpsaE1pSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCMFpYTjBMbU52YlNJc0ltbGhkQ0k2TVRZMU1UazBPRFl5TjMwLmRNZ2NsSDJsUXYtLWVLb25IekZ3UmlPV2tHcFl0Sk9POHljWS0yX1k3NGsifQ==; path=/; httponly'
    return [`session=${base64};`];

}

jest.mock('../nats-wrapper')

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri)
})

beforeEach( async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
        await collection.deleteMany({});
    }
})


afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
}, 60000)