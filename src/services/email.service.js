import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env,
    port: process.env,
    secure: true,
    auth: {
        user: process.env,
        pass: process.env
    }
})


const emailSender = {
    availableBookNotif: async (username, useremail) => {
        try {
            const mailOption = {
                from: ``,
                to: "",
                subject: "",
                html: `
                       
                `
            }

            const mail1 = await transporter.sendMail(mailOption)
            console.log(`Mail envoye avec succes à ${useremail}, (id : ${info.messageId})`);
            return mail1
        }
        catch (error) {

        }

    },

    BooksNotif: async (username, useremail) => {
        try {
            const mailOption = {
                from: ``,
                to: "",
                subject: "",
                html: `
                       
                `
            }

            const mail2 = await transporter.sendMail(mailOption)
            console.log(`Mail envoye avec succes à ${useremail}, (id : ${info.messageId})`);
            return mail2
        }
        catch (error) {

        }

    },

}

export default emailSender