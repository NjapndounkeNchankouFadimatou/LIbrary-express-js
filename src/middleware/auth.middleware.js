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

        const decoded_user = jwt.decode(accessToken);
        const tokenUser = prisma.users.findUnique({
            where: { user_id: decoded_user.id }
        })
        if (tokenUser.deconnect) {
            return res.status(httpCode.UNAUTHORIZED).json({ message: 'User is disconnected' })

        }
        const decoded = jwt.verify(token, process.env.ACCESS_KEY)

        req.user = decoded

        next()
    }
    catch (error) {
        return res.status(httpCode.UNAUTHORIZED).json({ message: 'Expired token' })
    }
}

export default authMiddleWare