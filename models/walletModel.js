const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const walletschema = new Schema({
   userId : {
      type : Schema.Types.ObjectId,
      ref : 'User'
   },
   wallet : {
      type : Number,
   },
   invite : [
      {
         type : Schema.Types.ObjectId,
         ref : 'User',
      }
   ]
})

module.exports = mongoose.model('wallet',walletschema);
