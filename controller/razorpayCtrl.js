const Razorpay = require('razorpay')

var instance = new Razorpay({ 
   key_id: process.env.razorpay_key_id, 
   key_secret: process.env.razorpay_key_secret 
});

const createOrder = (req,res,orderId) => {
   try{
      const oder = req.session.orderSummary
      var options = {
         amount: oder.total ,  // amount in the smallest currency unit
         currency: "INR",
         receipt: orderId
      };
      console.log('payment options :',options);
      instance.orders.create(options, function(err, order) {
         if(err){
            console.log('Razor pay error :',err);
         }else{
            console.log('data in razor pay :',order);
            res.json({order : order,paymentMethod : "online"})
         }
         
      });

   }catch(err){
      console.log(err);
   }
}

module.exports = {
   createOrder,
}