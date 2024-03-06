const mongoose = require('mongoose');
require('dotenv').config();

const Schema = mongoose.Schema;
const categoryschema = new Schema(
   {
      name : {
         type : String,
      },
      status : {
         type : String,
         default : 'listed',
      }
   },
   {
      timestamps : true, 
   }
);

const categories = mongoose.model('category',categoryschema)
module.exports = categories;