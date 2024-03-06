const mongoose = require('mongoose')

const dbConnect = () => {
   try{
      const con = mongoose.connect(process.env.MONGODB_URL);
      console.log("Database connedeted successfully");
   }
   catch(error){
      console.log("Database error");
   }
}
module.exports = dbConnect;