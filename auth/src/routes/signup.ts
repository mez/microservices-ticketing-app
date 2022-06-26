import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { User } from '../models/User'
import { BadRequestError, validateRequest } from '@anonytickets/common'


const router = express.Router()

router.post('/signup',[
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage('Password must be 4-20 characters')
],
validateRequest, 
async (req: Request, res: Response) => {

    const {email, password} = req.body;
    
    const emailExisting = await User.findOne({email});

    if (emailExisting) {
        throw new BadRequestError('Email already Exists.')
    } 

    const user = User.build({email, password});
    await user.save(); 

    // generate jwt 
    const token = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!)

    // store in cookie-session session object
    req.session = {
        jwt: token
    }
    
    res.status(201).send(user)

})

export { router as signupRouter}