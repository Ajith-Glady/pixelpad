const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const otpSchema = new mongoose.Schema({
   email : {
      type:String,
      required:true,
   },
   otp : {
      type : String,
      required : true,
   },
   created : {
      type : Date,
      default : Date.now,
      expires : 60*2,
   }
});
module.exports = mongoose.model("OTP",otpSchema);