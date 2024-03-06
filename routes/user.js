// const {render} = require('ejs');
const express = require('express');

const login = require('../middlewres/session')

const User = require("../models/userModel");
const userCtrl = require("../controller/userCtrl");
const userAuth = require("../controller/userAuth");
const cartCtrl = require('../controller/cartCtrl');
const userAddress = require('../controller/userAddress');
const orderCtrl = require('../controller/orderCtrl')
const wishListCtrl = require('../controller/wishListCtrl')
const orderReturn = require('../controller/orderReturn')
const coupon = require('../controller/couponCtrl')
const router = express.Router();

router.get('/',login.userExist,userCtrl.getGustPage)

router.get('/login',login.userExist,userAuth.getLoginPage);
router.post('/login',userAuth.postLoginPage)

router.get('/signup',login.userExist,userAuth.getSigninPage);
router.post('/signupotp',userAuth.userSignupOtp);
router.get('/getOtp',login.userExist,userAuth.getOtp)
router.post('/checkOtp',userAuth.postOtp)

router.get('/getHome',login.verifyUser,userCtrl.getHomePage)

router.get('/products',login.verifyUsernav,userCtrl.getProductPage)
router.get('/productDetails/:id',login.verifyUsernav,userCtrl.getProductDetails)

router.post('/searchProduct',login.verifyUsernav,userCtrl.searchProduct)
router.post('/applyFilter',login.verifyUsernav,userCtrl.postApplyFilter)
router.post('/sortProducts',login.verifyUsernav,userCtrl.sortProducts)



// ---------------cart-------------------
   


router.get('/cart',login.verifyUsernav,cartCtrl.getCart)
router.get('/addToCart/:id',login.verifyUsernav,cartCtrl.addToCart)
router.get('/qtyPlus/:id',login.verifyUsernav,cartCtrl.quantityPlus)
router.get('/qtyMinus/:id',login.verifyUsernav,cartCtrl.quantityMinus)
router.get('/removeItemFromCart/:id',login.verifyUsernav,cartCtrl.removeCartItem)


// ------------Profile --------------------


router.get('/profile',login.verifyUsernav,userCtrl.getProfile)
router.post('/editUser',login.verifyUsernav,userCtrl.editUserData)
router.get('/showAddress',login.verifyUsernav,userAddress.displayAddress)
router.get('/addAddress',login.verifyUsernav,userAddress.getAddAddress)
router.post('/addAddress',login.verifyUsernav,userAddress.postAddAddress)
router.get('/deleteAddress/:id',login.verifyUsernav,userAddress.getDeleteAddress)
router.get('/changePassword',login.verifyUsernav,userCtrl.getEditPassword)
router.post('/changePassword',login.verifyUsernav,userCtrl.postChangePassword)
router.get('/wallet',login.verifyUsernav,userCtrl.getWallet)


// ------------Order control -----------------

router.get('/checkout',login.verifyUsernav,orderCtrl.getCheckout)
router.get('/spotAddressAdd',login.verifyUsernav,orderCtrl.getAddAddress)
router.post('/spotAddressAdd',login.verifyUsernav,orderCtrl.postAddAddress)
router.get('/orderPlaced/:address/:payMethod',login.verifyUsernav,orderCtrl.placeOrder)
router.get('/orderSuccess',login.verifyUsernav,orderCtrl.orderSuccess)
router.post('/verifyPayment',login.verifyUsernav,orderCtrl.verifyPayment)
router.post('/applyCoupon',login.verifyUsernav,coupon.applyCoupon)
router.get('/checkoutReload',login.verifyUsernav,orderCtrl.checkoutReload)
router.get('/myOrders',login.verifyUsernav,orderCtrl.myOrders)
router.get('/trackOrder/:id',login.verifyUsernav,orderCtrl.getTrackOrder)
router.get('/cancelOrder/:id/:index',login.verifyUsernav,orderCtrl.getCancelOrder)
router.get('/productReturn/:id/:reson/:index/:proId',login.verifyUsernav,orderReturn.returnRequest)
router.get('/payOrderFromMyorder/:id',orderCtrl.paymentForFaild)


// --------------- Wish List----------

router.get('/wishList',login.verifyUsernav,wishListCtrl.getWishlist)
router.get('/addToWishlist/:id',login.verifyUsernav,wishListCtrl.addProduct)
router.get('/addToCartWish/:productId',wishListCtrl.addToCart)
router.delete('/deleteWishlistItem/:id',wishListCtrl.deleteWishlistItem)


// -------------- Coupon -------------

router.get('/coupons',login.verifyUsernav,coupon.userCouponShow)


// -------------- Invoice ----------------

router.get('/generateInvoice/:orderId/:index',login.verifyUsernav,orderCtrl.generateInvoice)
router.get('/downloadInvoice/:orderId',login.verifyUsernav,orderCtrl.downloadInvoice)



router.get('/logout',userAuth.logOut)

module.exports = router