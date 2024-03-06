const express = require('express');
const adminCtrl = require('../controller/adminCtrl');
const productCtrl = require('../controller/productCtrl')
const router = express.Router();
const check = require('../middlewres/session')
const upload = require('../middlewres/multer')
const order = require('../controller/adminOrderCtrl')
const coupon = require('../controller/couponCtrl')
const dashboard = require('../controller/adminDashboard')

router.get('/',check.adminExist,adminCtrl.getLogin)

router.post('/adminLogin',adminCtrl.postLogin)

router.get('/adminDashboard',check.verifyAdmin,dashboard.adminDashboard)

router.get('/users',check.verifyAdmin,adminCtrl.getUsers)

router.get('/blockUser/:id',check.verifyAdmin,adminCtrl.blockUser)

router.get('/unblockUser/:id',check.verifyAdmin,adminCtrl.unblockUser)

// ----------- Category Controll----

router.get('/category',check.verifyAdmin,adminCtrl.getCategory)
router.get('/addCate',check.verifyAdmin,adminCtrl.getAddCategory)
router.post('/addCate',check.verifyAdmin,adminCtrl.postAddCategory)
router.get('/editCate/:id',check.verifyAdmin,adminCtrl.getEditCate)
router.post('/editCate/:id',check.verifyAdmin,adminCtrl.postEditCate)
router.get('/deleteCate/:id',check.verifyAdmin,adminCtrl.deleteCategory)
router.get('/unlistCategory/:id',check.verifyAdmin,adminCtrl.unlistCategory)
router.get('/listCategory/:id',check.verifyAdmin, adminCtrl.listCategory)



// ---------- Product Controll -----------

router.get('/products',check.verifyAdmin,productCtrl.getProduct)
router.get('/addProduct',check.verifyAdmin,productCtrl.getAddProduct)


const uploadFields = [
   { name : "image1", maxCount : 1},
   { name : "image2", maxCount : 1},
   { name : "image3", maxCount : 1},
   { name : "image4", maxCount : 1},
];

router.post('/addProduct',upload.fields(uploadFields),productCtrl.postAddProduct)
router.get('/blockProduct/:id',check.verifyAdmin,productCtrl.getBlockProduct)
router.get('/unblockProduct/:id',check.verifyAdmin,productCtrl.getUnblockProduct)
router.get('/editProduct/:id',check.verifyAdmin,productCtrl.getEditProduct)
router.post('/editProduct/:id',upload.any(),productCtrl.postEditProduct)
router.get('/deleteProduct/:id',check.verifyAdmin,productCtrl.getDeleteProduct)


// --------------- User Order control -----------

router.get('/order',check.verifyAdmin,order.getOrders)
router.get('/updateOrderStatus/:status/:id',check.verifyAdmin,order.orderStatusUpdate)
router.get('/returnView/:id',check.verifyAdmin,order.orderReturnView)
router.get('/acceptReturn/:id/:odrId',check.verifyAdmin,order.acceptOrderReturn)
router.get('/rejectReturn/:id/:odrId',check.verifyAdmin,order.rejectOrderReturn)


// -------------------Coupon Control --------------

router.get('/coupon',check.verifyAdmin,coupon.adminShowCoupon)
router.post('/addCoupon',check.verifyAdmin,coupon.addCoupon)
router.get('/deleteCoupon/:id',check.verifyAdmin,coupon.deleteCoupon)
router.get('/editCoupon/:id',check.verifyAdmin,coupon.getEditCoupon)
router.patch('/editCoupon',check.verifyAdmin,coupon.patchEditCoupon)


// --------------Dashboard ------------------

router.get('/count-orders-by-day',dashboard.getCount)
router.get('/count-orders-by-month',dashboard.getCount)
router.get('/count-orders-by-year',dashboard.getCount)




router.get('/logout',adminCtrl.logOut)



module.exports=router