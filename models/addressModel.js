const mongoose = require('mongoose');

const addressschema = new mongoose.Schema(
   {
      userId : {
         type : mongoose.Schema.Types.ObjectId,
      },
      name : {
         type : String,
      },
      mobile : {
         type : Number,
      },
      email : {
         type : String,
      },
      address : {
         type : String,
      },
      pincode : {
         type : Number,
      },
      locality : {
         type : String,
      },
      city : {
         type : String,
      },
      district : {
         type : String,
      },
      state : {
         type : String,
      },
      addressType : {
         type : String,
      }
   }
);

module.exports = mongoose.model('address',addressschema);