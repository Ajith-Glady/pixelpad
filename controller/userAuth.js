const User = require('../models/userModel')
const otp = require('../models/otpModel')
const { hashData,verifyHash} = require('../util/bcrypt')
const {sendEmail} = require('../auth/nodemailer');

module.exports = {
   getLoginPage: (req, res) => {
      console.log('requested for the login page');
      res.render('user/login');
      console.log('hai');
   },
   postLoginPage: async (req,res) => {
      try{
         const {email,password} = req.body;
         console.log(email,password);
         const data = await User.findOne({email:email})
         console.log(data);
         const checkPass = await verifyHash(password,data.password)
         console.log(checkPass);
         if(data){
            console.log('datachek');
            if(checkPass){
               if(data.status == "true"){
                  console.log('data checked'); 
                  req.session.userdetails = data;
                  req.session.user=data.name;
                  req.session.userlogged=true;
                  req.session.email=data.email;
                  res.redirect('/getHome')
               }else{
                  res.render('user/login',{err:'This account is blocked !!'})
               }
            }else{
               res.render('user/login',{err:'Incorrect email or password'})
            }
            
         }else{
            console.log('datacheck failed');
            res.render('user/login',{err:"Incorrect email or password"})
         }
      }catch(err){
         console.log('error during login :',err)
         res.render('user/login',{err:' Incorrect email or password   !!'})
      }
   },

   getSigninPage: (req, res) => {
      res.render('user/sign-up');
   },

   userSignupOtp: async (req, res) => {
      try {
         console.log(req.body);
         const { fullName, email, password } = req.body;
         const exist = await User.findOne({ email: email})
         console.log(exist);
         if (exist) {
            console.log(`${req.body.email} already exists`);
            res.render("user/sign-up", { exist })
         }else{
            const hashedpass = await hashData(password)
            console.log(hashedpass);
            req.session.userdata = {
               name: fullName,
               email: email,
               password: hashedpass,
            };

            console.log(req.session.userdata);
            sendEmail(email)

            res.redirect('/getOtp')

         }

      } catch (err) {

         console.log(err);

      }

   },

   getOtp : (req,res) => {
      try{
         res.render('user/otp',{email:req.session.userdata.email})
      }catch(err){
         console.log(err);
      }
   },

   postOtp :async (req,res) => {
      try{
         const {num1,num2,num3,num4} = req.body;
         console.log('request body :',req.body);
         let otpReceived = [num1,num2,num3,num4].join('');
         console.log('post otp :',otpReceived);
         let check = await otp.findOne({otp:otpReceived});
         console.log('checking result :',check);
         if(check){
            console.log('correct user');
            
            await User.create({name:req.session.userdata.name,email:req.session.userdata.email,password:req.session.userdata.password,status:true});
            

            // res.redirect('/login'); 
            res.json({
               message : "Account Created !!",
               success : true
            })  
         }else{
            res.json({
               message : "Wrong OTP ! Please check your email...",
               success : false
            })
         }
      }catch(err){
         console.log(err);
         res.status(500).send(err);     
      }
   },


   logOut : (req,res) => {
      req.session.userlogged = false;
      req.session.user = null
      res.redirect('/');
      console.log('logout user successfully');
   }
}