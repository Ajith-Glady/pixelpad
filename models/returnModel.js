const mongoose = require('mongoose')

const returnschema = new mongoose.Schema(
   {
      userId : {
         type : mongoose.Schema.Types.ObjectId,
         ref : 'User'
      },
      orderId : {
         type : mongoose.Schema.Types.ObjectId,
         ref : 'order',
      },
      productId : {
         type : mongoose.Schema.Types.ObjectId,
         ref : 'product'
      },
      description : {
         type : String,
      },
      status : {
         type : String,
         default : "requested",
      },
   }
)

module.exports = mongoose.model('return',returnschema)