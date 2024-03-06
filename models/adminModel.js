const mongoose = require('mongoose');  
require('dotenv').config();

const Schema = mongoose.Schema;
const adminschema = new Schema(
   {
      name:{
         type:'String',
      },
      email:{
         type:'String',
      },
      password:{
         type:'String',
      },
   },
   {
      timestamps:true,
   }
);

const admins = mongoose.model('admin',adminschema);
module.exports = admins;