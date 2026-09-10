import { Router } from "express";
import userController from "../controller/user.controller.js";

const userRoute = Router()

const userPattern ={
    signup : '/users/signup',
    login :'users/login',
    logout :'users/logout',
    getUser :'users/profile/:id',
    update :'users/profile',
    delete :'users/profile',
}

userRoute.post(userPattern.signup , userController.signup)
userRoute.post(userPattern.login , userController.login)
userRoute.post(userPattern.logout , userController.logout)
userRoute.get(userPattern.getUser , userController.getProfile)
userRoute.put(userPattern.update , userController.updateProfile)
userRoute.delete(userPattern.delete , userController.deleteProfile)


export default userRoute