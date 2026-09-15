import prisma from "../lib/prisma.js";
import httpCode from "../static/httpCode.js";
import { v4 as uuidv4 } from 'uuid'
import emailSender from "../services/email.service.js";


const loanController = {
    addLooan: async (req, res) => {
        try {
            const { userId, booksId, status } = req.body
            if (!userId || !booksId)
                return res.status(httpCode.BAD_REQUEST).json({ message: "Enter the desired book" })

            const bookExist = await prisma.library.findUnique({
                where: { Lib_id: booksId }
            })
            if (!bookExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "This book does not exist" })
            }

            const loaned = await prisma.loan.findFirst({
                where: { booksId: booksId }
            })
            if (loaned) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "There is already a loan for this book" })
            }

            const userLoan = await prisma.users.findFirst({
                where: { user_id: userId }
            })

            if (!userLoan) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "This user does not exist" })
            }

            const userName = userLoan.name
            const userEmail = userLoan.email

            const loanDate = new Date()
            const dueDate = new Date(loanDate)
            dueDate.setDate(dueDate.getDate() + 10)

            const loanBook = await prisma.loan.create({
                data: {
                    loan_id: uuidv4(),
                    status: status,
                    isReserved: true,
                    dueDate: dueDate,
                    userId: userId,
                    booksId: booksId
                },
                include: {
                    library: { select: { title: true } },
                    user: { select: { name: true } },

                }
            })

             if(loanBook){
                emailSender.BooksNotif(userName, userEmail, dueDate)
             }

            return res.status(httpCode.OK).json({ message: "Succesffully loaned", loanBook })

/*
            const reminder1 = new Date(dueDate)
            reminder1.setDate(reminder1.getDate() - 5)

            const reminder2 = new Date(dueDate)
            reminder2.setDate(reminder2.getDate() - 3)

            const reminder3 = new Date(dueDate)
            reminder3.setDate(reminder3.getDate() - 1)

            if (reminder1) {
                emailSender.BooksNotif(userName, userEmail, reminder1)

            }
*/
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },


    updateLoanStatus: async (req, res) => {
        try {
            const { booksId } = req.params
            const { status, userId } = req.body

            // const LoanExist = await prisma.loan.findFirst({
            //     where: { loan_id: loan_id }
            // })
            // if (!LoanExist) {
            //     return res.status(httpCode.BAD_REQUEST).json({ message: "No loan" })
            // }
            const loanedBook = await prisma.loan.findFirst({
                where: { booksId: booksId }
            })

            if (!loanedBook) {
                return res.status(httpCode.NOT_FOUND).json({ message: "No loan for this book" })
            }

            const available = await prisma.loan.update({
                where: { booksId: booksId },
                data: { status: status },
                include: {
                    library: { select: { title: true } }
                }

            })
            if (!available) {
                return res.status(httpCode.NOT_FOUND).json({ message: "Error while updating status" })
            }

            const reservedBook = loanedBook.isReserved
            if (reservedBook) {
                const reservedBookUser = await prisma.users.findFirst({
                    where: { user_id: userId }
                })

                if (!reservedBookUser) {
                    return res.status(httpCode.NOT_FOUND).json({ message: "No reservation made by this user" })
                }

                const userEmail = reservedBookUser.email
                const userName = reservedBookUser.name

                await emailSender.availableBookNotif(userName, userEmail)
            }
            return res.status(httpCode.OK).json({ message: "Book successfully loaned" })

        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    loanHist: async (req, res) => {
        try {
            const { userId } = req.params
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
    },

    loanHistV2: async (req, res) => {
        try {
            const { userId } = req.params
            const user = await prisma.users.findFirst({
                where: { user_id: userId },
                include: { loans: true }
            })

            if (!user) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "This user does not exist" })
            }

            const loans = user.loans
            return res.status(httpCode.OK).json({ message: "User loan history", loans })

        }

        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    }
}

export default loanController