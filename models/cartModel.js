const mongoose = require('mongoose')

const cartschema = new mongoose.Schema(
   {
      userId : {
         type : mongoose.Schema.Types.ObjectId,
         ref : 'User'
      }, 
      products : [
         {
            productId : {
               type : mongoose.Schema.Types.ObjectId,
               ref : 'product',
            },
            quantity : {
               type : Number,
            },
            price :{
               type : Number,
            }
         }
      ]
   },
   {
      timestamps : true,
   }
);

module.exports = mongoose.model('cart',cartschema)