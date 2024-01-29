const nodemailer = require("nodemailer")

const sendEmail = async(options)=>{
    //create a trnsporter
    //define the email options
    //send the email

    // const transporter = nodemailer.createTransport({
    //     service: "Gmail",
    //     auth:{
    //         user:process.env.EMAIL_USERNAME,
    //         password:process.env.EMAIL_PASSWORD

    //         //Activate in gmil "less secured app " option 
    //     }
    // })

    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: "Anubhav Maurya anubhawmaurya@gmail.com",
        to:options.email,
        subject:options.subject,
        text:options.message
      }


      await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;