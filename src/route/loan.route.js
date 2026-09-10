import { Router } from "express";
import loanController from "../controller/loan.controller.js";


const loansRouter = Router()

const loansPattern = {
    makeLoan : 'loans',
    updateLoan : 'loans/:id/return',
    getLoans : 'loans/user/user',
}

loansRouter.post(loansPattern.makeLoan, loanController.addLooan)
loansRouter.put(loansPattern.updateLoan, loanController.updateLoanStatus)
loansRouter.get(loansPattern.getLoans, loanController.loanHist)

export default loansRouter