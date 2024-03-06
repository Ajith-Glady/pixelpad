const mongoose = require('mongoose')
const Schema = mongoose.Schema

const couponschema = new Schema({
   userId : {
      type : Schema.Types.ObjectId,
      ref : 'User',
   },
   couponCode : {
      type : String,
   },
   minPurchaseAmount : {
      type : Number,
   },
   discountAmount : {
      type : Number,
   },
   expiryDate : {
      type : Date,
   }
})

module.exports = mongoose.model('coupon',couponschema)