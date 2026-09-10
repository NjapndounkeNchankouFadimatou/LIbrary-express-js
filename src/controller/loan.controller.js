import prisma from "../lib/prisma.js";
import httpCode from "../static/httpCode.js";
import emailSender from "../services/email.service.js";


const loanController = {
    addLooan: async (req, res) => {
        try {
            const { userId, booksId, status } = req.body
            if (!userId || !booksId)
                return res.status(httpCode.BAD_REQUEST).json({ message: "Enter the desired book or author" })

            const bookExist = await prisma.library.findUnique({
                where: { Lib_id: booksId }
            })
            if (!bookExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "This book does not exist" })

            }
            const loaned = await prisma.loan.findFirst({
                where: {
                    booksId: booksId,
                    status: status
                }
            })
            if (loaned) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "there is alreaady a loan for this book" })

            }

            const loanBook = await prisma.loan.create({
                data: {
                    status: status,
                    userId: userId,
                    booksId: booksId
                },
                include: {
                    library: { select: { title: true } },
                    user: { select: { name: true } },

                }
            })
            return res.status(httpCode.OK).json({ message: "Succesffully loaned", loanBook })


        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    updateLoanStatus: async (req, res) => {
        try {
            const { loan_id} = req.params
            const {status}  =req.body

            const LoanExist = await prisma.loan.findFirst({
                where: { loan_id: loan_id }
            })
            if (!LoanExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "No loan" })
            }

            const available = await prisma.loan.update({
                where: { loan_id: LoanExist.loan_id },
                data: { status: status },
                include: {
                    library: { select: { title: true } }
                }

            })
            return res.status(httpCode.OK).json({ message: "Book available", available })
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    loanHist: async (req, res) => {
        try {
            const { userId } = req.body
            const UserLoan = await prisma.users.findFirst({
                where: { user_id: userId }
            })

            if (!UserLoan) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "This user does not exist" })
            }

            const loans = await prisma.loan.findMany({
                where: { userId }
            })
            if (!loans) {
                return res.status(httpCode.NOT_FOUND).json({ message: "No loans for this user" })
            }
            return res.status(httpCode.OK).json({ message: "User loan history", loans })

        }

        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    }
}

export default loanController