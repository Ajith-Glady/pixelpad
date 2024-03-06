const nodemailer = require('nodemailer');
const {otpGenerator} = require('../util/otpGenerator');
const otp = require('../models/otpModel')
require("dotenv").config()


async function sendEmail(receipientMail){

   await otp.deleteOne({email:receipientMail})
   let OTP = await otpGenerator();
   // req.session.otp = OTP;
   console.log('OTP is : '+OTP);

   await otp.create({email:receipientMail,otp:OTP})
   setTimeout(async()=> {
      await otp.deleteOne({email:receipientMail})
   },120000)

   let transporter = nodemailer.createTransport({
      service : 'gmail',
      auth : {
         user : process.env.email_,
         pass : process.env.password_
      }
   });

   transporter.verify((err,success) => {
      if(err){
         console.log(err);
      }else{
         console.log('No problem');
      }
   })

   let mailOptions = {
      form : process.env.email_,
      to : receipientMail , 
      subject : 'pixelpad e-commerce pvt ltd',
      text : `Your OTP code is :${OTP}`
   };


   let info = await transporter.sendMail(mailOptions);
   console.log(`Email send to ${receipientMail} : ${info.messageId}`);

}

module.exports = {sendEmail}