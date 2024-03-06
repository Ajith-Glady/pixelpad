const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const wallethistoryschema = new Schema({
   userId : {
      type : Schema.Types.ObjectId,
      ref : 'User',
   },
   refund : [
      {
         amount : {
            type : Number
         },
         reason : {
            type : String,
         },
         type : {
            type : String,
         },
         date : {
            type : Date,
         },
      },
   ],
   
})

module.exports = mongoose.model('walletHistory',wallethistoryschema)