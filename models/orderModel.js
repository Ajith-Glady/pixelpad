const mongoose = require('mongoose');

const orderschema = new mongoose.Schema({
   userId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User',
      
   },
   products : [
      {
         productId : { type : mongoose.Schema.Types.ObjectId,ref : 'product'},
         quantity : { type : Number},
         price : { type : Number },
         status : { type : String , default : "Processed"},

      },
   ],
   address : {
      name : String,
      address : String,
      locality : String,
      city : String,
      district : String,
      state : String,
      pincode : Number,
   },
   orderDate : {
      type : Date,
      required : true,
   },
   expectedDeliveryDate: Date,
   paymentMethod: String,
   paymentStatus: String,
   totalAmount: Number,
   deliveryDate: Date,
   orderStatus: String,
   couponDiscount: Number,
   couponCode: String,
   discountAmount: Number,
   subTotalAmount : Number,
})

const order = mongoose.model("order",orderschema);
module.exports = order ; 