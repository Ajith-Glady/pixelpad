const product = require('../models/productModel')
const cart = require('../models/cartModel')
const user = require('../models/userModel')
const address = require('../models/addressModel')
const order = require('../models/orderModel')
const orderReturn = require('../models/returnModel')
const wallet = require('../models/walletModel')
const walletHistory = require('../models/walletHistoryModel')
const crypto = require('crypto')
const {createOrder} = require('../controller/razorpayCtrl')
const {generateInvoice} = require('../util/invoiceGenerator')

module.exports = {
   getCheckout : async (req,res) => {
      try{
         console.log('reached to getcheckout page');
         const [adrs,wlt,crt] = await Promise.all([
            address.find({userId : req.session.userdetails._id}),
            wallet.findOne({userId : req.session.userdetails._id}),
            cart.findOne({userId : req.session.userdetails._id})
         ])
         let wltAmount = 0
         if(wlt == null){
            wltAmount = null
         }else{
            wltAmount = wlt.wallet
         }
         console.log('wishlist data :',wlt);
         console.log('Address is : ',adrs);
         console.log('cart details :',crt);
         console.log('order details : ',req.session.orderSummary);
         
         res.render('user/checkOut',{user : req.session.user,addrs : adrs,successMessage: null,walt : wltAmount, oder : req.session.orderSummary})
      }catch(err){
         console.log(err);
      }
   },


   getAddAddress : async (req,res) => {
      try{
         console.log('reached to add new address from checkout page');
         res.render('user/addAddress',{user : req.session.user})
      }catch(err){
         console.log(err);
      }
   },

   postAddAddress : async (req,res) => {
      try{
         console.log('reached to add new address');
         let addressdata = req.body
         console.log('New user address is :',addressdata);
         addressdata.userId = req.session.userdetails._id;
         console.log('address data with user id :',addressdata);
         let added = await address.create(addressdata)
         console.log('data added ?? :',added);
         const adrs = await address.find({userId : req.session.userdetails._id})
         // res.render('user/checkOut',{user : req.session.user,addrs : adrs,successMessage: 'Address added successfully',oder : req.session.orderSummary})
         res.redirect('/checkout') 
      }catch(err){
         console.log(err);
      }
   },


   


   placeOrder : async (req,res) => {
      try{
         console.log('reached to place order page');

         // const orderDetails = await cart.findOne({userId : req.session.userdetails._id})
         const [orderDetails,adrs] = await Promise.all([
            cart.findOne({userId : req.session.userdetails._id}),
            address.findOne({_id : req.params.address})
         ])
         const orderSummary = req.session.orderSummary
         const payMethod = req.params.payMethod
         


         const odrDate = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
         });

         const deliveryDate = new Date(
            Date.now() + 4 * 24 * 60 * 60 * 1000)
            .toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

         if(payMethod == 'cash'){
            let myOrders = {
               userId : req.session.userdetails._id,
               products : orderDetails.products,
               address : {
                  name : adrs.name,
                  address : adrs.address,
                  locality : adrs.locality,
                  city : adrs.city,
                  district : adrs.district,
                  state : adrs.state,
                  pincode : adrs.pincode,
               },
               orderDate : odrDate,
               expectedDeliveryDate : deliveryDate,
               paymentMethod : payMethod,
               paymentStatus : "pending",
               couponDiscount : orderSummary.couponDiscount,
               couponCode : orderSummary.coupnCode,
               totalAmount : orderSummary.total,
               orderStatus : "Order Processed",
               discountAmount : orderSummary.discount,
               subTotalAmount : orderSummary.subTotal,
               
         
            }

            console.log("order details in collection ..:",myOrders);

            for(let data of orderDetails.products){
               console.log('products in data :',data);
               const singleProduct = await product.findOne({_id : data.productId})
               const originalQuantity = singleProduct.stock
               const purchasedQuantity = data.quantity
               const newQuantity = originalQuantity - purchasedQuantity
               console.log('old quantity :',originalQuantity);
               console.log('new quantity :',newQuantity);
               
               await product.updateMany({
                  _id : data.productId
               },
               {
                  $set : 
                  {
                     stock : newQuantity,
                  }
               })

               console.log('product quantity decreased successfuly ............');

            }

            await Promise.all([
               order.create(myOrders),
               cart.deleteOne({userId : req.session.userdetails._id})
            ])

            const data = {
               msg : 'Order Placed Successfully',
               paymentMethod : payMethod,
            }


            

            res.json(data)


         }else if(payMethod == 'online'){
            console.log('online payment request got........');
            let myOrders = {
               userId : req.session.userdetails._id,
               products : orderDetails.products,
               address : {
                  name : adrs.name,
                  address : adrs.address,
                  locality : adrs.locality,
                  city : adrs.city,
                  district : adrs.district,
                  state : adrs.state,
                  pincode : adrs.pincode,
               },
               orderDate : odrDate,
               expectedDeliveryDate : deliveryDate,
               paymentMethod : payMethod,
               paymentStatus : "pending",
               couponDiscount : orderSummary.couponDiscount,
               couponCode : orderSummary.coupnCode,
               totalAmount : orderSummary.total,
               orderStatus : "Order Processed",
               discountAmount : orderSummary.discount,
               subTotalAmount : orderSummary.subTotal,
               
         
            }
            

            for(let data of orderDetails.products){
               console.log('products in data :',data);
               const singleProduct = await product.findOne({_id : data.productId})
               const originalQuantity = singleProduct.stock
               const purchasedQuantity = data.quantity
               const newQuantity = originalQuantity - purchasedQuantity
               console.log('old quantity :',originalQuantity);
               console.log('new quantity :',newQuantity);
               
               await product.updateMany({
                  _id : data.productId
               },
               {
                  $set : 
                  {
                     stock : newQuantity,
                  }
               })

               console.log('product quantity decreased successfuly ............');
            }
            await Promise.all([
               order.create(myOrders),
               cart.deleteOne({userId : req.session.userdetails._id})
            ])

            const oder = await order.findOne({userId : req.session.userdetails._id}).sort({ orderDate : -1 });
            
            createOrder(req,res,oder._id + "")
            
         }else if(payMethod == 'wallet'){
            const wallt = await wallet.findOne({ userId : req.session.userdetails._id})
            console.log('bla bla bal',wallt);
            if(orderSummary.total <= wallt.wallet){ 

               let myOrders = {
                  userId : req.session.userdetails._id,
                  products : orderDetails.products,
                  address : {
                     name : adrs.name,
                     address : adrs.address,
                     locality : adrs.locality,
                     city : adrs.city,
                     district : adrs.district,
                     state : adrs.state,
                     pincode : adrs.pincode,
                  },
                  orderDate : odrDate,
                  expectedDeliveryDate : deliveryDate,
                  paymentMethod : payMethod,
                  paymentStatus : "paid",
                  couponDiscount : orderSummary.couponDiscount,
                  couponCode : orderSummary.coupnCode,
                  totalAmount : orderSummary.total,
                  orderStatus : "Order Processed",
                  discountAmount : orderSummary.discount,
                  subTotalAmount : orderSummary.subTotal,
                  
            
               }

               for(let data of orderDetails.products){
                  console.log('products in data :',data);
                  const singleProduct = await product.findOne({_id : data.productId})
                  const originalQuantity = singleProduct.stock
                  const purchasedQuantity = data.quantity
                  const newQuantity = originalQuantity - purchasedQuantity
                  console.log('old quantity :',originalQuantity);
                  console.log('new quantity :',newQuantity);
                  
                  await product.updateMany({
                     _id : data.productId
                  },
                  {
                     $set : 
                     {
                        stock : newQuantity,
                     }
                  })
   
                  console.log('product quantity decreased successfuly ............');
               }

               await Promise.all([
                  order.create(myOrders),
                  cart.deleteOne({userId : req.session.userdetails._id})
               ])
               
               const newAmount = wallt.wallet - orderSummary.total
               await wallet.updateOne({userId : req.session.userdetails._id},{$set : {wallet : newAmount}})

               const data = {
                  msg : 'Order created successfully',
                  paymentMethod : payMethod
               }
               res.json(data)

            }else{
               const data = {
                  msg : 'Insufficient balance in wallet',
               }
               res.json(data)
            }
         }
         
         
      }catch(err){
         console.log(err);
      }
   },

   verifyPayment : async(req,res) => {
      try{
         console.log('reached to verify payment');
         console.log('hoooi',req.body);
         let hmac = crypto.createHmac("sha256", process.env.razorpay_key_secret);
         hmac.update(req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id)
         hmac = hmac.digest('hex')

         
         console.log(hmac);
         console.log(req.body.payment.razorpay_signature);

         if(hmac == req.body.payment.razorpay_signature){

            const orderId = req.body.order.receipt;
            console.log('order id :',orderId);
            

            await order.updateOne({_id : orderId},{$set : {paymentStatus : "paid"}})

            console.log('verification success');

            res.json({success : true})
         }else{
            res.json({failure : true})
         }

      }catch(err){
         console.log(err);
      }
   },

   checkoutReload : async(req,res) => {
      try {
         console.log('Fetching checkout content');
         const [addresses, walletData, cartData] = await Promise.all([
             address.find({ userId: req.session.userdetails._id }),
             wallet.findOne({ userId: req.session.userdetails._id }),
             cart.findOne({ userId: req.session.userdetails._id })
         ]);
         console.log('Wallet data:', walletData);
         console.log('Addresses:', addresses);
         console.log('Cart details:', cartData);
         console.log('Order details:', req.session.orderSummary);
 
         
 
         res.render('user/checkout',{user : req.session.user,addrs : addresses,successMessage: null,walt : walletData.wallet, oder : req.session.orderSummary})
      } catch (err) {
         console.log(err);
         res.status(500).send('Internal Server Error');
     }
   },

   orderSuccess : async(req,res) => {
      try{
         console.log('reached to ordersuccess page');
         const odr = await order.findOne({userId : req.session.userdetails._id})
         console.log(odr);
         res.render('user/orderPlaced',{data : odr,user : req.session.user})
      }catch(err){
         console.log(err);
      }
   },


   myOrders: async (req, res) => {
      try {
        console.log('Reached to my Orders');
        const userId = req.session.userdetails._id;
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Number of orders per page
        const skip = (page - 1) * limit;
    
        const orderDetails = await order.find({ userId: userId })
          .populate("products.productId")
          .sort({ orderDate: -1 })
          .skip(skip)
          .limit(limit);
    
        const totalOrders = await order.countDocuments({ userId: userId });
    
        console.log('Order details of the user: ', orderDetails);
        console.log('Products in order details: ', orderDetails[0].products);
    
        res.render('user/myOrders', {
          user: req.session.user,
          orders: orderDetails,
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit)
        });
      } catch (err) {
        console.log(err);
      }
   },

   getTrackOrder : async (req,res) => {
      try{
         console.log('reached to trackOrder route >>>>');
         const orderId = req.params.id
         console.log('Order id: ',req.params.id );
         const orderdetails = await order.findOne({_id : orderId}).populate("products.productId")
         const rtn = await orderReturn.findOne({orderId : orderId})
         console.log('retur??',rtn);
         console.log('order details : ',orderdetails);
         res.render('user/trackOrder',{user : req.session.user , odrDetail : orderdetails , retn : rtn})
      }catch(err){
         console.log(err);
      }
   },

   getCancelOrder : async (req,res) => {
      try {
         console.log('reached to delete from track order');
         let{id,index} = req.params
         console.log(id,--index);

         const odr = await order.findOne({ _id : id}).populate('products.productId')
         const productId = odr.products[index].productId._id;
         let pro = await product.findOne({_id : productId})
         
         let quantity = odr.products[index].quantity
         const orgQuantity = pro.stock
         const newQuantity =  orgQuantity + quantity
         
         const [update,cancel] =await Promise.all([
            product.updateOne({ _id : odr.products[index].productId._id },{$set : {stock : newQuantity}}),
            order.updateOne({ _id : id , 'products._id' : odr.products[index]._id},{ $set : { 'products.$.status' : 'cancelled'}})
         ]);

         console.log('product after cancel :', cancel);
         const oder = await order.findOne({ _id : id}).populate('products.productId')
         const checkCancel = oder.products.every(obj => obj.status == 'cancelled');   
         if(checkCancel){
            await order.updateOne({_id : id},{$set : {orderStatus:'cancelled'}})
         }

         if(oder.paymentMethod == 'online' || oder.paymentMethod == 'wallet'){

            // ----------- Adding amount to wallet --------
         const wallt = await wallet.findOne({userId : oder.userId})
         if(wallt){
            const oldAmount = wallt.wallet
            const addAmount = odr.products[index].productId.price
            const newAmount = oldAmount + addAmount
            await wallet.updateOne({ userId : oder.userId},{$set : {wallet : newAmount}})
         }else{
            const amt = odr.products[index].productId.price
            await wallet.create({userId : oder.userId , wallet : amt})
         }


         // --------- Wallet history updation---------------

         const walltHistry = await walletHistory.findOne({userId : oder.userId})
         if(walltHistry){
            const dat = new Date()
            await walletHistory.updateOne(
               {userId : oder.userId},
               {$push : {refund : {
                  amount : odr.products[index].productId.price,
                  reason : "Prepayed order returned",
                  type : 'credit',
                  date : dat,
               }}}
            )
         }else{
            const dat = new Date()
            await walletHistory.create({
               userId : oder.userId,
               refund :[{
                  amount : odr.products[index].productId.price,
                  reason : "Prepayed order returned",
                  type : 'credit',
                  date : dat,
               }]
            })
         }
         }


         res.json({
            success : true,
         })
         // const cancel = await order.updateOne({ _id : id, 'products._id' : odr.products[index]._id},
         // { $set : {'products.$.status': 'cancelled'}})
         // console.log(cancel);
      }catch(err){
         console.log(err);
      }
   },

   generateInvoice : async (req,res) =>{
      try{
         console.log('reached to generate invoice');
         const {orderId,index} = req.params;

         const orderDeatails = await order.findOne({_id : orderId}).populate('products.productId')
         const deliveriedProducts = orderDeatails.products.filter(product => product.status === 'Processed')

         if(orderDeatails){
            const invoicePath = await generateInvoice(orderDeatails,index,deliveriedProducts)
            res.json({
               success : true,
               message : "Invoice genrated successfully"
            })
         }else{
            res.status(500).json({ 
               success: false, 
               message: "Invoice generation failed" 
            });
         }

      }catch(err){
         console.log(err);
      }
   },


   downloadInvoice : async (req,res) =>{
      try{
         const id = req.params.orderId
         console.log(id);
         const filepath = `public/invoice/${id}.pdf`
         res.download(filepath,`invoice_${id}.pdf`)
      }catch(err){
         console.log(err);
      }
   },

   // ------------ Payment from myOrder-------------

   paymentForFaild : async (req,res) => {
      try{
         console.log('reached to payfrom my order');
         const oder = await order.findOne({userId : req.session.userdetails._id,_id : req.params.id});

         let odrSmry = {
            subTotal : oder.subTotalAmount,
            discount : oder.discountAmount,
            total : oder.totalAmount,
         }
         req.session.orderSummary = odrSmry
            
         createOrder(req,res,req.params.id + "")
      }catch(err){
         console.log(err);
      }
   }



}