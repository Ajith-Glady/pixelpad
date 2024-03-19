const products = require('../models/productModel');
const cart = require('../models/cartModel')
const category = require('../models/categoryModel')
const address = require('../models/addressModel')
const user = require('../models/userModel')
const wishList = require('../models/wishListModel')
const { hashData,verifyHash} = require('../util/bcrypt')
const wallet = require('../models/walletModel')
const walletHistory = require('../models/walletHistoryModel')
const banner = require('../models/bannerModel')

module.exports = {
   getGustPage : async(req,res) => {
      const pro = await products.find({status : 'active'}).sort({ createdAt: -1 }).limit(4)
      const banr = await banner.find({bannerName : /^mainBanner/})
      const subBanner = await banner.find({ bannerName: /^subBanner/ })
      console.log('products :',pro);
      console.log('Banner :',banr);
      console.log('sub banner :',subBanner);
      res.render('user/userHome',{user : req.session.user,pro,banr,subBanner});
   },
   
   getHomePage :async(req,res)=> {
      const pro = await products.find({status : 'active'}).sort({ createdAt: -1 }).limit(4)
      const banr = await banner.find({bannerName : /^mainBanner/})
      const subBanner = await banner.find({ bannerName: /^subBanner/ })
      console.log('products :',pro);
      res.render('user/userHome',{user : req.session.user,pro,banr,subBanner})
   },

   getProductPage :async (req,res) => {
      try{
         let data = await req.session.userdata;
         // console.log(data);

         

         const [product, count ,categories , wish] = await Promise.all([
            products.find({ status: 'active' }),
            products.find({ status: 'active' }).count(),
            category.find({ status : 'listed'}),
            wishList.find({userId : req.session.userdetails._id})
          ]);

          

         res.render('user/products',{product, count ,categories, wish})
      }catch(err){
         console.log(err);
      }
   },

   getProductDetails : async (req,res) => {
      try{
         console.log('reached to product details page !!');
         let id = req.params.id
         const pro = await products.findOne({ _id : id})
         console.log(id);
         console.log(pro);
         const cartItem = await cart.findOne({'products.productId' : id,userId : req.session.userdetails._id})

         console.log('The is in the cart :',cartItem);
         res.render('user/productDetails',{product : pro, cart : cartItem})
      }catch(err){
         console.log(err);
      }
   },



  

   searchProduct : async (req,res) => {
      try{
         console.log('reached to search product');
         let search = req.body.data;
         if(search){
            console.log('hai');
            const categry = await category.findOne({ name: { $regex:search, $options: "i"} });
            const laptops = await products.find({lapName : {$regex : search,$options : "i"}})
            console.log('products find :',laptops);
            const categoryId = categry ? categry._id : null; // Get category _id or null if not found
            if(categry){
               const pro = await products.find({category : categoryId})
               const [ctgry] = await Promise.all([
                  category.find(),
               ])
               
               console.log('result get is : ',pro);
               res.render('user/products',{product:pro,count:pro.length,categories:ctgry,  user:req.session.user})
            }else if(laptops.length > 0){
               const ctgry = await category.find()
               res.render('user/products',{product:laptops,count:laptops.length,categories:ctgry,  user:req.session.user})
            }else{
               res.render('user/searchNotFound')
            }


         }else{
            res.redirect('/products')
         }
      }catch(err){
         console.log(err);
      }
   },

   postApplyFilter : async (req,res) => {
      try{
         console.log('reached to apply filter');
         const {categories , minPrice, maxPrice} = req.body
         console.log('data :',categories);
         console.log('data :',minPrice);
         console.log('data :',maxPrice);
         let pro

         if(categories == undefined && maxPrice){
            pro = await products.find({
               discountPrice : {$gte : minPrice, $lte : maxPrice},
               status : "active"
            })
         }else if(categories == undefined){
            pro = await products.find({ status : "active"})
         }else if(categories && maxPrice){
            pro = await products.find({
               category : {$in : categories},
               price : {$gte : minPrice, $lte : maxPrice},
               status : "active",
            })
         }else if(categories){
            pro = await products.find({
               category : {$in : categories},
               status : "active",
            })
         }
         const ctgry = await category.find()
         res.render('user/products',{product:pro,count:pro.length,categories:ctgry,user:req.session.user})
         console.log(pro);

      }catch(err){
         console.log(err);
      }
   },


   sortProducts : async (req,res) => {
      try{
         console.log('reached to sort');
         const sortMethod = req.body.data
         let pro
         if(sortMethod == 'name') {
            pro = await products.find().sort({ lapName: 1 })
         }else if(sortMethod == 'price'){
            pro = await products.find().sort({ discountPrice : 1 })
         }else if(sortMethod == 'date'){
            pro = await products.find().sort({ createdAt: 1 })
         }
         const ctgry = await category.find()
         res.render('user/products',{product:pro,count:pro.length,categories:ctgry,user:req.session.user})
      }catch(err){
         console.log(err);
      }
   },



   // --------------User profile ------------


   getProfile : async (req,res) => {
      try{
         console.log('reached to user profile');
         console.log(req.session.userdetails);
         let pagestatus = 'profile';
         let userdata = await user.findOne({_id : req.session.userdetails._id})   
         const wlt = await wallet.findOne({ userId : req.session.userdetails._id})

         res.render('user/profile',{user : req.session.user, data : userdata, page : pagestatus , address : [],err :null , walt : wlt})
      }catch(err){
         console.log(err);
      }
   },

   editUserData : async (req,res) => {
      try{
         console.log('reached to edit user data');
         console.log(req.body.name);
         await user.updateOne(
            {
               _id : req.session.userdetails._id,
            },
            {
               $set : {
                  name : req.body.name,
               }
            }
         )

         res.redirect('/profile')
      }catch(err){
         console.log(err);
      }
   },

   getEditPassword : async(req,res) => {
      try{
         console.log('reached to edit Password....');
         const userdata = await user.findOne({_id : req.session.userdetails._id})
         console.log('user Details :',userdata);
         const pagestatus = 'changePassword'
         res.render('user/profile',{user : req.session.user,data : userdata,page : pagestatus,address : [],err :null})

      }catch(err){
         console.log(err);
      }
   },

   postChangePassword : async (req,res) => {
      try{
         console.log('reached to post edit password');
         const {oldPassword,newPassword,confirmPassword} = req.body
         console.log(oldPassword,newPassword,confirmPassword);
         const pagestatus = 'changePassword'
         const userdata = await user.findOne({_id : req.session.userdetails._id})

         const passCheck = await verifyHash(oldPassword,userdata.password)
         if(passCheck){
            console.log('correct password');
            if(newPassword == confirmPassword){
               const hashedPassword = await hashData(confirmPassword)
               await user.updateOne({ _id : req.session.userdetails._id},{$set : {password : hashedPassword}})
               res.redirect('/profile')
            }else{
               res.render('user/profile',{user : req.session.user, data : userdata , page : pagestatus, address : [] , err : "Incorrect confirm password"})
            }
         }else{
            res.render('user/profile',{user : req.session.user, data : userdata , page : pagestatus, address : [] , err : "Incorrect password"})
         }

      }catch(err){
         console.log(err);
      }
   },
   getWallet : async(req,res) => {
      try {
         console.log('reached to wallet page');
 
         const currentPage = req.query.page || 1; 
         const offset = (currentPage - 1) * 10;
         const [walletData, walletHistoryData] = await Promise.all([
             wallet.findOne({ userId: req.session.userdetails._id }),
             walletHistory.findOne({ userId: req.session.userdetails._id })
         ]);

         if(walletData){
            const totalItems = walletHistoryData.refund.length;
            const totalPages = Math.ceil(totalItems / 10);
   
            res.render('user/walletDetails', {
               user: req.session.user,
               walletAmount: walletData.wallet,
               walletHistry: walletHistoryData,
               currentPage: currentPage,
               pages: totalPages,
               startIndex: offset,
               endIndex: offset + 10
            });
         }else{
            res.render('user/emptyWallet')
         }
 
         
     } catch (err) {
         console.log(err);
         res.status(500).send('Internal Server Error');
     }
   }

}
