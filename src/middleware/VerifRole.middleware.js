import httpCode from "../static/httpCode.js";


const verifRole = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(httpCode.UNAUTHORIZED).json({ message: "No authenfication for this user" })
        }
        if (req.user.role !== 'ADMIN') {
            return res.status(httpCode.FORBIDDEN).json({ message: 'Only admin can acces this routes' })
        }
        next()
    } catch (error) {
        return res.status(httpCode.SERVER_ERROR).json({ message: error.message })
    }

}

export default verifRole