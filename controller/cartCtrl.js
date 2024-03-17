const product = require('../models/productModel')
const cart = require('../models/cartModel')
const user = require('../models/userModel')

module.exports = {

   getCart : async(req,res) => {
      try{
         const cartItems = await cart.find({userId : req.session.userdetails._id})
         const data = [];
         let num = 0;
         console.log('Items in cart : ',cartItems); 
         if(cartItems.length == 0){
            res.render('user/emptyCart',{user : req.session.user})
         }else{

            let itm = cartItems[0].products
            console.log('hooi...', itm);

            let odrSmry = {
               subTotal : 0,
               discount : 0,
               total : 0,
            }

            for(let i = 0;i<itm.length;i++){
            
               let item = await product.findOne({ _id : itm[i].productId})
               console.log(item);
               num += itm[i].quantity

               item.totalprice = item.discountPrice * itm[i].quantity

               odrSmry.subTotal = odrSmry.subTotal + item.price
               odrSmry.total += item.totalprice

               data.push(item);
            }
            odrSmry.discount = odrSmry.subTotal - odrSmry.total
            req.session.orderSummary = odrSmry;
            console.log('Order summary : ',odrSmry);
            console.log('products in the cart : ',data);
            console.log('no of items in the cart :',num);

         
            res.render('user/cart',{products : data,items : num, cart : itm, orderSummary : odrSmry,user : req.session.user})

         }

         
      }catch(err){

         console.log(err); 

      }

   },

   addToCart : async(req,res) => {
      try{
         console.log('reached to addtocart');
         const person = req.session.userdetails
         console.log(person);
         const [usercheck , pro] = await Promise.all([
            cart.findOne({userId :  person._id}),
            product.findOne({_id : req.params.id})
         ])

         console.log('product iss....',pro);
         console.log('user already have cart ::',usercheck);

         if(usercheck == null){

            console.log('new cart');
            const firstcart = {
               userId : person._id,
               products : [
                  {
                     productId : req.params.id,
                     quantity : 1,
                     price : pro.discountPrice
                  }
               ]
            }
            await cart.create(firstcart);
            res.redirect(`/productDetails/${req.params.id}`)
         }
         else{
            console.log('adding items to existing cart...');
            await cart.updateOne(
               {
                  userId : person._id,
               },
               {
                  $push : 
                  {
                     products : 
                     {
                        productId : req.params.id,
                        quantity : 1,
                        price : pro.discountPrice
                     }
                  }
               }
            )

            console.log('success...');
            res.redirect(`/productDetails/${req.params.id}`)

         }
         
         
         
      }catch(err){
         console.log(err);
      }

   },

   quantityPlus : async (req,res) => {
      try{
         console.log('reache to quantity plus...');
         id = req.params.id
         usrid = req.session.userdetails._id;
         console.log('product id :',id);
         console.log('user id :',usrid);
         let pro = await cart.findOne({userId : usrid,'products.productId' : id})
         console.log('updating cart : ',pro);
         let qty = pro.products[0].quantity
         console.log('quantity of the updating product :', qty);
         let produ = await product.findOne({_id : id})
         let orgQty = produ.stock
         console.log('Original quantity of the product : ',orgQty);
         if(qty >= orgQty){
            console.log('Maximum number of products reached !!');
            res.redirect('/cart')
         }else{
            await cart.updateOne(
            {
               userId : usrid,
               'products.productId' : id,
            },
            {
               $inc : {
                  'products.$.quantity' : 1,
               }
            }
         );

         console.log('quantity increment done !!');
         res.redirect('/cart')
         }
         
         


      }catch(err){
         console.log(err);
      }
   },

   quantityMinus : async (req,res) => {
      try{
         console.log('reache to quantity Minus...');
         id = req.params.id
         usrid = req.session.userdetails._id;
         console.log('product id :',id);
         console.log('user id :',usrid);
         let pro = await cart.findOne({userId : usrid,'products.productId' : id})
         console.log('updating cart : ',pro);
         let qty = pro.products.find(product => product.productId.toString() === id);
         console.log('the quantity is :.......',qty.quantity);
         
         if(qty.quantity > 1 ){

            await cart.updateOne(
               {
                  userId : usrid,
                  'products.productId' : id,
               },
               {
                  $inc : {
                     'products.$.quantity' : -1,
                  }
               }
            );
   
            console.log('quantity decrement done !!');
            res.redirect('/cart')
         }

         console.log('You are requested to decrese less than 1 !!');
         res.redirect('/cart')


      }catch(err){
         console.log(err);
      }
   },

   removeCartItem : async (req,res) => {
      try{
         console.log('reached to remove single item');

         let pro = await cart.updateOne(
            {
               userId : req.session.userdetails._id,
            },
            {
               $pull : {
                  products : {
                     productId : req.params.id,
                  }
               }
            }
         );

         console.log('The cart is : ',pro);

         res.redirect('/cart')

      }catch(err){
         console.log(err);
      }
   },



   

}