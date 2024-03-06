const product = require('../models/productModel')
const wishList = require('../models/wishListModel')
const cart = require('../models/cartModel')
const user = require('../models/userModel')

module.exports = {

   getWishlist: async (req, res) => {
      try {
         console.log('reached to wishlist page ctrl...');
         const wish = await wishList.findOne({ userId: req.session.userdetails._id }).populate("products.productId")
         console.log('data in wishlist :', wish.products);
         res.render('user/wishList', { user: req.session.user, wishlist : wish })
      } catch (err) {
         console.log(err);
      }
   },

   addProduct: async (req, res) => {
      try {
         console.log('a laptop is going to added to the wishlist ..');
         const person = req.session.userdetails
         const pro = req.params.id
         const usr = await wishList.findOne({ userId: person._id })
         console.log('user exist ??', usr);
         console.log('product id :', pro);
         if (usr == null) {
            const add = await wishList.create({
               userId: req.session.userdetails._id,
               products: [
                  {
                     productId: pro,
                  }
               ]
            }
            )

            console.log(add);
            res.json({
               success : true,
               message : 'Item added to Wishlist'
            })
         }else{
            const check = await wishList.findOne({userId : req.session.userdetails._id,'products.productId' : pro})
            console.log('wishlist check :',check);
            if(check){
               res.json({
                  success : true,
                  message : 'Item already in wishlist'
               })
            }else{
               const update = await wishList.updateOne(
                  {
                     userId : req.session.userdetails._id,
                     $push : {
                        products : [
                           {
                              productId : pro,
                           }
                        ]
                     }
                  }
               )
               console.log('product added to wishlist');
               res.json({
                  success : true,
                  message : 'Item added to wishlist'
               });
            }
         }

      } catch (err) {
         console.log(err);
      }
   },


   addToCart : async(req,res) => {
      try{
         console.log('reached to add to cart');
         const person = req.session.userdetails
         console.log(person);
         console.log(req.params);

         let prod = await cart.findOne({userId : person._id , 'products.productId' : req.params.productId})
         console.log('product in cart : ',prod);

         if(prod != null){
            res.json({
               success : true,
               message : 'This product already in cart'
            })
         }else{
            const [usercheck , pro] = await Promise.all([
               cart.findOne({userId :  person._id}),
               product.findOne({_id : req.params.productId})
            ])
   
            console.log('product iss....',pro);
            console.log('user already have cart :',usercheck);
   
            if(usercheck == null){
   
               console.log('new cart');
               const firstcart = {
                  userId : person._id,
                  products : [
                     {
                        productId : req.params.productId,
                        quantity : 1,
                        price : pro.discountPrice
                     }
                  ]
               }
   
               await cart.create(firstcart);
               res.json({
                  success : true,
                  message : 'Laptop added to cart'
               })
               // res.redirect(`/productDetails/${req.params.id}`)
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
                           productId : req.params.productId,
                           quantity : 1,
                        }
                     }
                  }
               )
   
               console.log('success...');
               res.json({
                  success : true,
                  message : 'Laptop added to cart '
               })
               // res.redirect(`/productDetails/${req.params.id}`)
   
            }
         }
         
      }catch(err){
         console.log(err);
      }
   },

   deleteWishlistItem : async (req,res) => {
      try{
         console.log('reached to delete single item');
         console.log(req.params.id);
         await wishList.updateOne(
            {
               userId : req.session.userdetails._id,
            },
            {
               $pull : {
                  products : {
                     productId : req.params.id
                  }
               }
            }
         );

         res.json({
            success : true,
            message : 'Item deleted from wishlist'
         })
      }catch(err){
         console.log(err);
      }
   }
}