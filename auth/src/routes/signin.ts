import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { User } from '../models/User'
import { BadRequestError, validateRequest } from '@anonytickets/common'
import { Password } from '../utils/password'

const router = express.Router()

router.post('/signin', 
    [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You need to supply a password.')
    ], 
    validateRequest,
    async (req: Request, res: Response) => {

    const {email, password} = req.body;
    const existingUser = await User.findOne({email})
    if (!existingUser) {
        throw new BadRequestError('Invalid Credentials.')
    }

    const isPasswordMatching = await Password.compare(existingUser.password, password)
    if (!isPasswordMatching) {
        throw new BadRequestError('Invalid Credentials.')
    }

    // generate jwt 
    const token = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
    }, process.env.JWT_KEY!)

    // store in cookie-session session object
    req.session = {
        jwt: token
    }

    res.status(200).send(existingUser)

})

export { router as signinRouter}