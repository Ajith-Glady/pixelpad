const mongoose = require('mongoose')

const productschema = new mongoose.Schema(
   {
      brand : {
         type : String,
         
      },
      lapName : {
         type : String,
      },
      price : {
         type : Number,
      },
      discountPrice : {
         type : Number,
      },
      category : {
         type : mongoose.Schema.Types.ObjectId,
         ref : 'category',
      },
      description : {
         type : String,
      },
      specOne : {
         type : String,
      },
      specTwo : {
         type : String,
      },
      specThree : {
         type : String,
      },
      specFour : {
         type : String , 
      },
      stock : {
         type : Number,
      },
      tag : {
         type : String
      },
      status : {
         type : String,
      },
      images : {
         type : Array,
         required : true
      }
      
      
   },
   {
      timestamps : true,
   }
);

module.exports = mongoose.model('product',productschema);