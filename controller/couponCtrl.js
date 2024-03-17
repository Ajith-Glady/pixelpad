const coupon = require('../models/couponModel')
const order = require('../models/orderModel')

module.exports = {
   adminShowCoupon : async(req,res) => {
      try{
         console.log('reached to admin show coupons ');
         const coup = await coupon.find()
         console.log(coup);

         res.render('admin/couponList',{cupn : coup})
      }catch(err){
         console.log(err);
      }
   },

   addCoupon : async (req,res) => {
      
      try{
         console.log('reached to add new coupon');
         const couponData = req.body
         const couponCheck = await coupon.findOne({couponCode : couponData.couponCode})
         if(couponCheck){
            res.json({
               success : false,
               message : "This coupon code is already exists"
            })
         }else{
            const addCup = await coupon.create(couponData)
            res.json({
               success : true,
               message : 'coupon added successfully'
            })
         }
         
      }catch(err){
         console.log(err);
      }
   },

   deleteCoupon : async(req,res) => {
      try{
         console.log('reached to delete coupon');
         const id = req.params.id
         const dlt = await coupon.deleteOne({_id : id})
         console.log(dlt);
         res.json({data : 'coupon deleted successfully'})
      }catch(err){
         console.log(err);
      }
   },

   getEditCoupon: async (req, res) => {
      try {
         const id = req.params.id;
         const couponData = await coupon.findOne({ _id: id });
         if (!couponData) {
            return res.status(404).json({ message: 'Coupon not found' });
         }
         const formattedExpiryDate = couponData.expiryDate.toISOString().split('T')[0];

         res.json({
            _id: couponData._id,
            couponCode: couponData.couponCode,
            minPurchaseAmount: couponData.minPurchaseAmount,
            discountAmount: couponData.discountAmount,
            expiryDate: formattedExpiryDate,
         });

      } catch (err) {
         console.log(err);
         res.status(500).json({ message: 'Internal server error' });
      }
   },

   patchEditCoupon : async(req,res) => {
      try{
         console.log('reached to patch edit coupon');
         const couponData = req.body
         const checkCoupon = await coupon.findOne({couponCode : couponData.couponCode})
         if(checkCoupon == null){
            res.json({
               success : false,
            })
         }else{
            const result = await coupon.updateOne(
               {
                  _id : couponData._id,
               },
               {
                  $set :{
                     couponCode : couponData.couponCode,
                     minPurchaseAmount : couponData.minPurchaseAmount,
                     discountAmount : couponData.discountAmount,
                     expiryDate : couponData.expiryDate,
                  }
               }
            )
            console.log(result);
            res.json({
               success : true,
            })
         }
         
         
      }catch(err){
         console.log(err);
      }
   },


   userCouponShow : async(req,res) => {
      try{
         console.log('reached to ueser show coupons ......');
         const couponData = await coupon.find()
         console.log(couponData);
         res.render('user/coupon',{cupn : couponData , user : req.session.user})
      }catch(err){
         console.log(err);
      }
   },

   applyCoupon : async(req,res) => {
      try{
         console.log('reached to apply coupon')
         console.log(req.body);
         const couponCode = req.body.couponCode
         const findCoupon = await coupon.findOne({couponCode : couponCode});
         const summary = req.session.orderSummary
            
            
         console.log(findCoupon);   
         console.log(summary);

         if(findCoupon !== null){
            if(summary.total >= findCoupon.minPurchaseAmount){
               console.log('user is eligible for coupon')

               let totl = summary.total - findCoupon.discountAmount
               console.log('new total :',totl);


               let odrSummary = {
                  subTotal : summary.subTotal,
                  discount : summary.discount,
                  total : totl,
                  couponDiscount : findCoupon.discountAmount,
                  coupnCode : findCoupon.couponCode
               }
               req.session.orderSummary = odrSummary;

               res.json(success ={
                  success : true,
                  message : "Coupon Applied Successfully.."
               })

            }else{
               res.json(error = {
                  error : true,
                  message : 'This coupon is not applicable !!'
               })
            }                                    

         }else{
            res.json(error =  {
               error : true,
               message : 'Invalid coupon Code !!'
            })
         }

         // res.json({
         //    success: true,
         //    message: 'Coupon applied successfully'
         // });
         
      }catch(err){
         console.log(err);
      }
   }
}