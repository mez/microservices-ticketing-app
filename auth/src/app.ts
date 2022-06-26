import express from 'express'
import 'express-async-errors'

import { json } from 'express'
import cookieSession from 'cookie-session'

import { errorHandler, NotFoundError } from '@anonytickets/common'

// Routes
import { currentUserRouter } from './routes/current-user'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'


const app = express()

app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))

app.use('/api/users', currentUserRouter)
app.use('/api/users', signinRouter)
app.use('/api/users', signoutRouter)
app.use('/api/users', signupRouter)

app.all('*', async (req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }
