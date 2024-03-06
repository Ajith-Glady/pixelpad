const address = require('../models/addressModel')

module.exports = {
   displayAddress :async (req,res) => {
      try{
         console.log('reached to display address');
         let pagestatus = 'showAddress'

         let adrs = await address.find({userId : req.session.userdetails._id})
         console.log('user address is :',adrs);
         let userName = req.session.user;
         let details = req.session.userdetails;


         res.render('user/profile',{user : userName, data : details, page : pagestatus, address : adrs,err :null,walt : null})      
         
      }catch(err){
         console.log(err);
      }
   },


   getAddAddress : async (req,res) => {
      try{
         console.log('reached to add new address');
         let adrs = await address.find({_id : req.session.userdetails._id})
         res.render('user/profile',{user : req.session.user, data : req.session.userdetails, page : 'addAddress',address : adrs,err :null,walt : null})
      }catch(err){
         console.log(err);
      }
   },


   postAddAddress : async (req,res) => {
      try{
         console.log('reached to add new address');
         let addressdata = req.body
         console.log('New user address is :',addressdata);
         addressdata.userId = req.session.userdetails._id;
         console.log('address data with user id :',addressdata);
         let added = await address.create(addressdata)
         console.log('data added ?? :',added);
         res.redirect('/showAddress'); 
      }catch(err){
         console.log(err);
      }
   },


   getDeleteAddress : async (req,res) => {
      try{
         console.log('reached to delete address..');
         const id = req.params.id
         console.log(id);
         let adrs = await address.findOne({_id : id})
         console.log(adrs);
         if(adrs){
            await address.deleteOne({_id : id})
            res.redirect('/showAddress'); 
         }
      }catch(err){
         console.log(err);
      }
   }
}