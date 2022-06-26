import request from 'supertest'
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';


declare global {
    var signin: () => Promise<string[]>
}

global.signin = async () => {
    const email = 'test@test.com'
    const password = 'password'

    const signupResponse = await request(app)
    .post('/api/users/signup')
    .send({
        email,
        password
    })
    .expect(201);

    const cookie = signupResponse.get('Set-Cookie');

    return cookie;
}


let mongo: any;
beforeAll(async () => {

    process.env.JWT_KEY = 'asdf';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri)
})

beforeEach( async () => {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
        await collection.deleteMany({});
    }
})


afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
}, 60000)