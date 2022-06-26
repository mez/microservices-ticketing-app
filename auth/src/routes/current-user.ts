import express from 'express'
import jwt from 'jsonwebtoken'

import { currentUser } from '@anonytickets/common'

const router = express.Router()


router.get('/me', currentUser, (req, res) => {
    res.send({currentUser: req.currentUser || null})
})

export { router as currentUserRouter}