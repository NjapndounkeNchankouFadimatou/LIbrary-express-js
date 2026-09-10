import httpCode from "../static/httpCode.js";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'



const authMiddleWare = (req, res, next) => { // a request is made up of a body and a header
    try {
        const tokenHeader = req.headers.authorization //--
        if (!tokenHeader || !tokenHeader.startsWith('Bearer')) {
            return res.status(httpCode.UNAUTHORIZED).json({ message: 'No token available' })
        }
        const token = tokenHeader.split(' ')[1]

        const decoded_user = jwt.verify(token, process.env.ACCES_KEY )
        const tokenUser = prisma.users.findUnique({
            where: { user_id: decoded_user.id }
        })
        if (tokenUser.deconnect) {
            return res.status(httpCode.UNAUTHORIZED).json({ message: 'User is disconnected' })
        }
        req.user = decoded_user

        next()
    }
    catch (error) {
        return res.status(httpCode.UNAUTHORIZED).json({ message: 'Expired token', error : error.message })
    }
}

export default authMiddleWare