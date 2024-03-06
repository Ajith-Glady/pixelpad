const admin = require('../models/adminModel');
const users = require('../models/userModel')
const products = require('../models/productModel')
const category = require('../models/categoryModel')
const { rawListeners } = require('../models/userModel');

module.exports = {
   getLogin : (req,res) => {
      console.log('reached to login');
      res.render('admin/login')
   },

   postLogin : async (req,res) => {
      try{
         const adminEmail = process.env.adminEmail;
         const adminPass = process.env.adminPassword;
         console.log(adminEmail,adminPass);
         if(adminEmail == req.body.email && adminPass == req.body.password ){

            req.session.adminlogged = true;
            req.session.admin = adminEmail;
            res.redirect('/admin/adminDashboard')

         }else{
            console.log('invalid email or password');
            res.render('admin/login',{err:'Invalid email or password'})
         }
         

         
      }
      catch(err){
         console.log(err);
      }
   },


   getUsers: async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Number of users per page
        const skip = (page - 1) * limit;
    
        const usersCount = await users.countDocuments({});
        const totalPages = Math.ceil(usersCount / limit);
    
        const userData = await users.find({})
          .skip(skip)
          .limit(limit);
    
        console.log(userData);
        res.render('admin/users', { user: userData, currentPage: page, totalPages });
      } catch (err) {
        console.log(err);
      }
   },
    


   blockUser : async(req,res) => {
      try{
         console.log('blocking user...');
         const filter = { _id: req.params.id };
         let x = req.params.id
         console.log(x);
         const update = { $set: { status: 'block' } };
         await users.updateOne(filter,update);
         console.log('Blocked successfully...');
         res.redirect('/admin/users')
      }
      catch(err){
         console.log(err);
      }
   },
 

   unblockUser : async (req,res) => {
      try{
         console.log('Unblocking a user....');
         const filter = {_id : req.params.id};
         let x = req.params.id
         console.log(x);
         const update = {$set : { status : 'true' } };
         await users.updateOne(filter,update);
         console.log('Unblocked successfully...');
         res.redirect('/admin/users')
      }
      catch(err) {
         console.log(err);g
      }
   },



   // ----------- Category controll------------------


   getCategory : async (req,res) => {
      try{
         console.log('Reach to getcategory');
         const data = await category.find({});
         console.log(data);
         res.render('admin/categories',{categories : data})
      }catch(err) {
         console.log(err);
      }
   },

   getAddCategory : async (req,res) => {
      try{
         console.log('reached to addCategory');
         res.render('admin/addcategory')
      }catch(err) {
         console.log(err);
      }
   },

   postAddCategory : async (req,res) => {
      try{
         console.log('Reached to post Addcategory');
         let data = req.body.categoryName.trim().toLowerCase(); // Convert the input to lowercase
         console.log(data);

         let check = await category.findOne({ name: { $regex: new RegExp('^' + data + '$', 'i') } });

         // console.log(check);
         if(check){
            console.log('this category already exist :',check);
            res.render('admin/addcategory',{err:'This category is already exist !!'})
         }else{
            category.create({name:data})
            res.redirect('/admin/category')
         }
         
      }catch(err) {
         console.log(err);
      }
   },


   getEditCate : async (req,res) => {
      try{
         const data = req.params.id;
         console.log('data from edit',data);
         let cate = await category.findOne({_id : data})
         res.render('admin/editcategory',{category : cate})
      }catch(err){
         console.log(err);
      }
   },

   
   postEditCate : async (req,res) => {
      try{
         console.log('reached to post editcategory');
         let path = req.params.id;
         let data = req.body.categoryName.trim();
         const check = category.findOne({name : data})
         if(check){
            console.log('already existed name : ',check);
            res.render('admin/editcategory',{err : 'This category name is already exists !!',category : check})   
         }else{
            await category.updateOne({ _id : path},{ $set : { name : data} });
            res.redirect('/admin/category')
         
         }
         
      }catch(err){
         console.log(err);
      }
   },


   deleteCategory : async (req,res) => {
      try{
         console.log('reach to Category delete');
         let id = req.params.id;
         console.log(id);
         let data = await products.find({ category : id})
         await products.deleteMany({category : id})
         await category.deleteOne({_id : id})
         res.redirect('/admin/category')
      }catch(err){
         console.log(err);
      }
   },

   unlistCategory : async(req,res) => {
      try{
         console.log('reached to unlist category');
         const id = req.params.id

         await category.updateOne({_id : id},{$set : {status : 'unlisted'}})

         const result = await products.updateMany({ category: id }, { $set: { status: 'unlisted' } });
         

         res.json({success : true})
      }catch(err){
         console.log(err);
      }
   },

   listCategory : async(req,res) => {
      try{
         console.log('reached to list category');
         const id = req.params.id
         
         await category.updateOne({_id : id},{$set : {status : 'listed'}})
         await products.updateMany({ category: id }, { $set: { status: 'active' } });

         res.json({success : true})
      }catch(err){
         console.log(err);
      }
   },


   logOut : (req,res) => {
      req.session.adminlogged = false;
      console.log('admin logout success..');
      res.redirect('/admin');
   }
}