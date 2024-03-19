const mongoose = require('mongoose')

var bannerSchema = new mongoose.Schema({
   bannerName: {
      type: String
   },
   bannerImage: {
      type: String,
      required: true,
   },
});

//Export the model
module.exports = mongoose.model('banner', bannerSchema);