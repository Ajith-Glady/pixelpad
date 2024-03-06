const user = require('../models/userModel')








const verifyUser = async  (req, res, next) => {
  
   if (req.session.userlogged) {
    const users=await user.findOne({email:req.session.email})
    console.log(">>>>>>>>>>>>>>>>>>>>>>>",users );
     if(users.status=='block'){
       req.session.email=false;
       res.redirect("/");
     }else{
       res.locals.user=users.name
       next();
     }
    
   } else {
     res.redirect("/");
   }
 };



 const verifyUsernav = async (req, res, next) => {
 
  if (req.session.userlogged) {
    const users= await user.findOne({email:req.session.email})
   
      if(users.status=='blocked'){
        req.session.userlogged=false;
        res.redirect("/");
      }else{
        res.locals.user=users.name
        next();
      }
  } else {
    res.redirect("/login");
  }
};





// before login


const userExist = (req, res, next) => {
   if (req.session.userlogged) {
     res.redirect("/getHome");
   } else {
     next();
   }
 };
 

 const adminExist = (req, res, next) => {
   if (req.session.adminlogged) {
     res.render('admin/dashboard')
   } else {
     next()
   }
 };


 const verifyAdmin=(req,res,next)=>{
   if (req.session.adminlogged) { 
     next()
   } else {
     res.redirect('/admin')
   }

 }



 module.exports = {
   verifyUser,
   userExist,
   adminExist,
   verifyAdmin,
   verifyUsernav,

 }