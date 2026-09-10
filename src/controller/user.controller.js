import prisma from "../lib/prisma.js";
import httpCode from "../static/httpCode.js";
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const generated_access_token = (user) => {
    return jwt.sign({
        id: user.user_id,
        name: user.name,
        role: user.role
    },
        process.env.ACCES_KEY,
        { expiresIn: "10m" }

    )
}
const generated_refresh_token = (user) => {
    return jwt.sign({
        id: user.user_id,
        name: user.name,
        role: user.role
    },
        process.env.REFRESH_KEY,
        { expiresIn: "7d" }

    )
}
const userController = {
    signup: async (req, res) => {
        try {
            const { name, email, password, role } = req.body
            if (!name || !email || !password)
                return res.status(httpCode.BAD_REQUEST).json({ message: "All the fields are required" })

            const emailExist = await prisma.users.findUnique({
                where: { email }
            })
            if (emailExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "You are already a user " })
            }

            const hashPassword = await bcrypt.hash(password, 10)

            const user = await prisma.users.create({
                data: {
                    user_id: uuidv4(),
                    name,
                    email,
                    password: hashPassword,
                    role
                }
            })

            return res.status(httpCode.CREATED).json({ message: "User successfully added", user })

        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body

            if (!password || !email){
                return res.status(httpCode.BAD_REQUEST).json({ message: "All the fields are required" })
            }

            const user = await prisma.users.findUnique({
                where: { email }
            })
            if (!user) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "SignIn " })
            }

            const passwordVerif = await bcrypt.compare(password, user.password)
            if (!passwordVerif) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "Wrong password or email " })
            }

            const accessToken = generated_access_token(user)
            const refreshToken = generated_refresh_token(user)

            const connectedUser = await prisma.users.update({
                where: { user_id: user.user_id },
                data: { refresh: refreshToken }
            })

            return res.status(httpCode.BAD_REQUEST).json({
                message: "Successfully connected",
                acess: accessToken,
                refresh: refreshToken,
                connectedUser
            })
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    logout: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const accessToken = authHeader.split(' ')[1];
            if (!accessToken) {
                return res.status(httpCode.NOT_FOUND).json({ message: "NO TOKEN" });
            }
            const decoded = jwt.verify(accessToken , process.env.ACCES_KEY);
            const profileId = decoded.id

            await prisma.users.update({
                where: { user_id: profileId },
                data: { deconnect: accessToken },
            });

            await prisma.users.update({
                where: { user_id: profileId },
                data: { refresh: null }
            });

            return res.status(httpCode.OK).json({ message: "user deconnected" });
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    getProfile: async (req, res) => {
        try {
            const { id } = req.params

            const profile = await prisma.users.findUnique({
                where: { user_id: id }
            })

            if (!profile) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "profile does not exist" })
            }

            return res.status(httpCode.OK).json({ message: "user profile", profile })
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    updateProfile: async (req, res) => {
        try {
            const { id } = req.params
            const { name, email, password } = req.body
            if (!name || !email || !password)
                return res.status(httpCode.BAD_REQUEST).json({ message: "All the fields are required" })

            const userExist = await prisma.users.findUnique({
                where: { user_id: id }
            })
            if (!userExist) {
                return res.status(httpCode.NOT_FOUND).json({ message: "No profile found" })
            }

            const updatedProfile = await prisma.users.update({
                where: { user_id: userExist.user_id },
                data: {
                    name: name ?? userExist.name,
                    email: email ?? userExist.email,
                    password: password ?? userExist.password
                }
            })

            return res.status(httpCode.OK).json({ message: "Profile updated", updatedProfile })

        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    deleteProfile: async (req, res) => {
        try {
            const { name, email, password } = req.body
            if (!name || !email || !password)
                return res.status(httpCode.BAD_REQUEST).json({ message: "All the fields are required" })

            const userExist = await prisma.users.findUnique({
                where: { email: email }
            })
            if (!userExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "No profile found" })
            }

            const deletedProfile = await prisma.users.delete({
                where: { user_id: userExist.user_id },
            })
            return res.status(httpCode.OK).json({ message: "Profile Deleted successfully", deletedProfile })

        }

        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    }
}

export default userController