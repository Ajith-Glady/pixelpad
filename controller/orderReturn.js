const order = require('../models/orderModel')
const orderReturn = require('../models/returnModel')

module.exports = {

   returnRequest : async (req,res) => {
      try {
         console.log('reached to product return');
         const id = req.params.id
         let index = req.params.index
         const proId = req.params.proId
         console.log("order id : ",id);
         console.log('product id :',proId);
         console.log("index of the return item : ",index);
         const odr = await order.findOne({ _id : id}).populate('products.productId')
         console.log('order product id :',odr.products[--index]);
         console.log("returning order :",odr);
         if(odr){
            console.log('reason for returning :',req.params.reson);
            const stsUpdate = await order.updateOne({ _id : id , 'products.productId' : proId }, {'products.$.status' : 'Return requested'})
            console.log('update status',stsUpdate);
            const rtn = await orderReturn.create({userId : req.session.userdetails._id , orderId : id ,productId : proId, description : req.params.reson })
            console.log('product status change :',rtn);
            const msg = {
               success : true,
            }
            res.json(msg)
         }
         
      }catch(err){
         console.log(err);
      }
   }

}