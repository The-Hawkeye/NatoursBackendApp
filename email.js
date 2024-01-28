const nodemailer = require("nodemailer")

exports.sendEmail = options=>{
    //create a trnsporter
    //define the email options
    //send the email

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth:{
            user:process.env.EMAIL_USERNAME,
            password:process.env.EMAIL_PASSWORD

            //Activate in gmil "less secured app " option 
        }
    })
}