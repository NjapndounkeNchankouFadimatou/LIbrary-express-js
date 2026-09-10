import { Router } from "express";
import loanController from "../controller/loan.controller.js";
import authMiddleWare from "../middleware/auth.middleware.js";


const loansRouter = Router()

const loansPattern = {
    makeLoan : '/loan',
    updateLoan : '/loans/:id',
    getLoans : '/loans/user/',
}

loansRouter.post(loansPattern.makeLoan,authMiddleWare,loanController.addLooan)
loansRouter.put(loansPattern.updateLoan,authMiddleWare,loanController.updateLoanStatus)
loansRouter.get(loansPattern.getLoans,authMiddleWare,loanController.loanHist)

export default loansRouter