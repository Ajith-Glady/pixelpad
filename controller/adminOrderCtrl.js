const users = require('../models/userModel')
const products = require('../models/productModel')
const category = require('../models/categoryModel')
const { rawListeners } = require('../models/userModel');
const orders = require('../models/orderModel')
const orderReturn = require('../models/returnModel');
const wallet = require('../models/walletModel')
const walletHistory = require('../models/walletHistoryModel')

module.exports = {

   getOrders : async (req,res) => {
      try{
         console.log('reached to admin orders ......');
         const currentPage = req.query.page || 1;
        const offset = (currentPage - 1) * 10;
         const oders = await orders.aggregate([
            {
               $lookup : {
                  from : 'users',
                  localField : 'userId',
                  foreignField : '_id',
                  as : 'userName'
               }
            },
            { $unwind : '$userName'},
           
            {$sort : { orderDate : -1}},
            {
               $project : {
                  username : "$userName.name",
                  'userId' : 1,
                  'products' : 1,
                  'address' : 1,
                  'orderDate' : 1,
                  'expectedDeliveryDate' : 1,
                  'paymentMethod' : 1,
                  'paymentStatus' : 1,
                  'totalAmount' : 1,
                  'deliveryDate' : 1,
                  'orderStatus' : 1,
                  'discountAmount' : 1,
                  'subTotalAmount' : 1,
               }
            }
         ]);

         const rtn = await orderReturn.find()
         console.log('retrurn requests: ',rtn);

         const totalItems = oders.length;
         const totalPages = Math.ceil(totalItems / 10);
         
         res.render('admin/orderList', {
            data: oders,
            retun: rtn,
            currentPage: currentPage,
            pages: totalPages,
            startIndex: offset,
            endIndex: offset + 10
        });
      }catch(err){
         console.log(err);
      }
   },

   orderStatusUpdate : async (req,res) => {
      try{
         console.log('haai');
         const id = req.params.id
         const status = req.params.status
         
         if(status == 'Order Delivered'){
            await orders.updateOne({_id : id},{$set : {orderStatus:status,paymentStatus : "paid"}})
         }else{
            const data = await orders.updateOne({_id : id},{$set : {orderStatus:status}})
            console.log(data);
         }
         
         res.redirect('/admin/order')
      }catch(err){
         console.log(err);
      }
   },

   orderReturnView : async (req,res) => {
      try{
         console.log('reached to return view!!');
         console.log('order id : ',req.params.id);
         const odr = await orders.findOne({_id : req.params.id}).populate('products.productId').populate('userId')
         console.log('requested details',odr.products[0]);
         // console.log(req.session.userdetails);
         const rtn = await orderReturn.find({orderId : req.params.id})
         console.log('return data : ',rtn);
         res.render('admin/returnDetails',{oder : odr,retun : rtn})
      }catch(err){
         console.log(err);
      }
   },

   acceptOrderReturn : async (req,res) => {
      try{
         console.log('reached to accept order return');
         await orderReturn.updateOne({_id : req.params.id},{$set : {status : 'returned'}})
         const rtn = await orderReturn.findOne({_id : req.params.id})
         console.log('hooi',rtn.productId);
         
         const x = await orders.updateOne(
            { _id: req.params.odrId, 'products.productId': rtn.productId },
            { $set: { 'products.$.status': 'returned' } }
         );
         console.log(x);   

         const walletuser = await wallet.findOne({userId : rtn.userId})
         const pro = await products.findOne({ _id : rtn.productId})
         if(walletuser){
            const oldAmount = walletuser.wallet
            
            const addAmound = pro.discountPrice
            const newAmount = oldAmount + addAmound ;
            await wallet.updateOne({ userId : rtn.userId},{$set : {wallet : newAmount}})
            
         }else{
            
            const amt = pro.discountPrice
            await wallet.create({userId : rtn.userId , wallet : amt})
            
         }

         // ---------- Wallet history updation --------------

         const walltHistry = await walletHistory.findOne({userId : rtn.userId})
         if(walltHistry){
            const dat = new Date()
            await walletHistory.updateOne(
               {userId : rtn.userId},
               {$push : {refund : {
                  amount : pro.discountPrice,
                  reason : "Order returned",
                  type : 'credit',
                  date : dat,
               }}}
            )
            
         }else{
            const dat = new Date()
            await walletHistory.create({
               userId : rtn.userId,
               refund :[{
                  amount : pro.discountPrice,
                  reason : "Order returned",
                  type : 'credit',
                  date : dat,
               }]
            })
         }

         res.redirect('/admin/order')
         
        
      }catch(err){
         console.log(err);
      }
   },

   rejectOrderReturn : async (req,res) => {
      try{
         console.log('reached to reject order return');
         console.log(req.params.id);
         console.log(req.params.odrId);

         const rtn = await orderReturn.findOne({_id : req.params.id})
         console.log(rtn);
         const rjt = await orders.updateOne(
            {_id : req.params.odrId, 'products.productId' : rtn.productId },
            { $set : { 'products.$.status' : 'rejected'}}
         )
         const x = await orderReturn.deleteOne({ _id : req.params.id})
         console.log(x);

         res.redirect('/admin/order')

      }catch(err){
         console.log(err);
      }
   }



}