const nodeMailer = require('nodemailer')

exports.transporter = nodeMailer.createTransport({
    name: process.env.EMAIL_NAME,
    secure: false,
    host: 'smtp.gmail.com',
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD
    }
});