import nodemailer from 'nodemailer'
import httpCode from '../static/httpCode.js'
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_HOST_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD
    }
})


const emailSender = {
    availableBookNotif: async (username, useremail) => {
        try {
            const mailOption = {
                from: ` "Fatima" <${process.env.EMAIL_USER}>`,
                to: useremail,
                subject: "Availability of book",
                html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #4A90E2; text-align: center;">!!! DISPONIBILITE DE LIVRE </h2>
                        <p>Bonjour, ${username}</p>
                        <p>Ceci est un un message pour vous notifie de la disponibilite du livre rechercher</p>
                        <p>Vous pouvez dès à présent vous connecter pour avoir acess a tout nos livre en exclusifs.</p>
                        <p style="font-size: 0.9em; color: #777;">Cordialement,<br>Fatima$Co</p>
                    </div>  
                       
                `
            }

            const mail1 = await transporter.sendMail(mailOption)
            console.log(`Mail envoye avec succes à ${useremail}, (id : ${info.messageId})`);
            return mail1
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }

    },

    BooksNotif: async (username, useremail) => {
        try {
            const mailOption = {
                from: ` "Fatima" <${process.env.EMAIL_USER}>`,
                to: useremail,
                subject: "Return Date",
                html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #4A90E2; text-align: center;">!!!DATE DE REMISE </h2>
                        <p>Bonjour, ${username}</p>
                        <p>Ceci est un un message pour vous notifie de l'approche de la date de remise du livre emprunte </p>
                        <p>Vous pouvez dès à présent vous connecter pour avoir acess a tout nos livre en exclusifs.</p>
                        <p style="font-size: 0.9em; color: #777;">Cordialement,<br>Fatima$Co</p>
                    </div>   
                `
            }
            const mail2 = await transporter.sendMail(mailOption)
            console.log(`Mail envoye avec succes à ${useremail}, (id : ${info.messageId})`);
            return mail2
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }

    }

}

export default emailSender