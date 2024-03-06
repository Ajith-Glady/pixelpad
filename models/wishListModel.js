const mongoose = require('mongoose')

const wishListschema = new mongoose.Schema(
   {
      userId : {
         type : mongoose.Schema.Types.ObjectId,
         ref : 'User',
      },
      products : [
         {
            productId : {
               type : mongoose.Schema.Types.ObjectId,
               ref : 'product'
            }
         }
      ]
   }
)

module.exports = mongoose.model('wishList',wishListschema);