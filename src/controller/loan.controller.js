import prisma from "../lib/prisma.js";
import httpCode from "../static/httpCode.js";
import { v4 as uuidv4 } from 'uuid'
import emailSender from "../services/email.service.js";
import cron from "node-cron";


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
                    dueDate: dueDate,
                    userId: userId,
                    booksId: booksId
                },
                include: {
                    library: { select: { title: true } },
                    user: { select: { name: true } },

                }
            })
            cron.schedule ('1 0 * * *', async ()=>{
                emailSender.BooksNotif(userName,userEmail,dueDate, bookExist.title)
            } )

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

    reservation: async (req, res) => {
        try {
            const { loan_id } = req.params
            const { userId, booksId, status, message } = req.body
            if (!userId || !booksId) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "Enter the desired book" })
            }

            const bookExist = await prisma.library.findUnique({
                where: { Lib_id: booksId }
            })
            if (!bookExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "This book does not exist" })
            }

            const reservationNotif = await prisma.notification.create({
                data: {
                    notif_id: uuidv4(),
                    message: message,
                    notif_status: status,
                    userId: userId,
                    booksId: booksId,
                    loanId: loan_id

                },
                include: {
                    library: { select: { title: true } },
                }
            })
            return res.status(httpCode.OK).json({ message: "Reservation done",reservationNotif})
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })
        }
    },

    updateLoanStatus: async (req, res) => {
        try {
            const { loanId } = req.params
            const { userId, booksId, status } = req.body

            if (!userId || !booksId) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "Enter the desired book" })
            }

            const LoanExist = await prisma.loan.findFirst({
                where: { loan_id: loanId },
                include: { notifications: true }
            })

            const loanedBook = await prisma.loan.findFirst({
                where: { booksId: booksId }
            })

            if (!loanedBook || !LoanExist) {
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

            const loanNotif = LoanExist.notifications

            for (const notif in loanNotif) {
                const userInfo = await prisma.users.findFirst({
                    where: { user_id: notif.userId }
                })

                if (!userInfo) {
                    return res.status(httpCode.BAD_REQUEST).json({ message: "This user does not exist" })
                }
                const userName = userInfo.name
                const userEmail = userInfo.email

                const notifStatus = notif.notif_status
                if (notifStatus === 'NOT_SEND') {
                    emailSender.availableBookNotif(userName, userEmail)

                    await prisma.notification.update({
                        where: { notif_id: notif.notif_id },
                        data: {
                            notif_status: 'SENT',
                            message: 'Book available'
                        }
                    })
                }// parcourir le tableau pour envoyer un message particulier au suivant
            }
            return res.status(httpCode.OK).json({ message: "Book status updated" })

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
            const user = await prisma.users.findUnique({
                where: { user_id: userId },
                include: { loans: true } // to include the loan table from user else it will be undefined
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