import express from 'express'
import 'express-async-errors'

import { json } from 'express'
import cookieSession from 'cookie-session'

import { errorHandler, NotFoundError, currentUser} from '@anonytickets/common'

import { indexOrderRouter } from './routes'
import { newOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'
import { deleteOrderRouter } from './routes/delete'

const app = express()

app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))

app.use(currentUser)

app.use('/api/orders', indexOrderRouter)
app.use('/api/orders', newOrderRouter)
app.use('/api/orders', showOrderRouter)
app.use('/api/orders', deleteOrderRouter)

app.all('*', async (req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }
