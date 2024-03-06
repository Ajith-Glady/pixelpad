// const mongoose = require("mongoose")
// var userSchema = new mongoose.Schema({
//    name:{
//       type: String,
//       // required:true,
//    },
//    email:{
//       type: String,
//       // required:true,
//       // unique:true,
//    },
//    password:{
//       type: String,
//       // required:true,
//    },
// });
// module.exports = mongoose.model("User",userSchema);

const mongoose=require("mongoose")
require('dotenv').config();

const Schema = mongoose.Schema;
//user schema
const userschema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("User", userschema);
module.exports = Users;