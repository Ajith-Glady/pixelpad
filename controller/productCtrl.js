const products = require('../models/productModel');
const category = require('../models/categoryModel');
const cart = require('../models/cartModel')

module.exports = {

   getProduct: async (req, res) => {
      try {
        console.log('Reached to getProduct');
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Number of products per page
        const skip = (page - 1) * limit;
    
        const productsCount = await products.countDocuments({});
        const totalPages = Math.ceil(productsCount / limit);
    
        const data = await products.find({})
          .populate('category')
          .skip(skip)
          .limit(limit);
    
        console.log(data);
        res.render('admin/productList', { products: data, currentPage: page, totalPages });
      } catch (err) {
        console.log(err);
      }
   },
    

   getAddProduct : async (req,res) => {
      try{
         console.log('reached getAddProduct');
         const categories = await category.find({})
         console.log(categories);
         
         res.render('admin/addProduct',{category : categories})
         console.log('add product is loaded');
      }catch(err){
         console.log(err);
      }
   },

   postAddProduct : async (req,res) => {
      try{
         console.log('come back with data');
         console.log('data from body :',req.body);
         console.log('files :',req.files);
         const files = req?.files
         let images  = [files.image1[0].filename,files.image2[0].filename,files.image3[0].filename,files.image4[0].filename]
         console.log(images);
         const pro = {
            ...req.body,
            images
         }
         console.log(pro);
         await products.create(pro)
         res.redirect('/admin/products')
      }catch(err){
         console.log(err);
      }
   },


   getBlockProduct : async (req,res) => {
      try{
         console.log('reached to block product');
         const filter = {_id : req.params.id}
         console.log(req.params.id);
         const update = { $set : { status : 'block'}}
         await products.updateOne(filter,update);
         console.log('Block aayi.....');
         res.redirect('/admin/products')

      }catch(err){
         console.log(err);
      }
   },

   getUnblockProduct : async (req,res) => {
      try{
         console.log('reached to Unblock product');
         const filter = {_id : req.params.id}
         console.log(req.params.id);
         const update = { $set : { status : 'active'}}
         await products.updateOne(filter,update);
         console.log('Unblock aayi....');
         res.redirect('/admin/products')
      }catch(err) {
         console.log(err);
      }
   },


   getEditProduct : async (req,res) => {
      try{
         console.log('reached to getEditProduct ...')
         const [product, categories] = await Promise.all([
            products.find({ _id : req.params.id}).populate('category'),
            category.find()
         ])
         res.render('admin/editProduct',{product : product[0],categories})
         console.log('edit porduct page loaded ...');
      }catch(err){
         console.log(err);
      }
   },

   postEditProduct : async (req,res) => {
      try{
         console.log('reached to postEditProduct ..');
         const id = req.params.id;
         console.log(id);
         const images = []
         const pro = await products.findOne({ _id : id})
         console.log(pro);
         if(pro){
            images.push(...pro.images)
         }
         console.log('old images',images);
         console.log('hooiii',req.files);

         for(let i=0;i<5;i++){
            if(req.files[i]){
                console.log("okkkk")
               let position=req.files[i].fieldname.split('')
               images[position[5]-1]=req.files[i].filename
            }
        }

        console.log('images',images)
        let updatedProducts = req.body;
        updatedProducts.images = images;
        console.log(updatedProducts);

        const upload = await products.updateOne({ _id : id},{ $set : {...updatedProducts}})

        if(upload){
         res.redirect('/admin/products')
        }

      }catch(err){
         console.log(err);
      }
   },


   getDeleteProduct :async (req,res) => {
      try{
         console.log('reached to delete product route');
         console.log(req.params.id);
         let id = req.params.id
         let del = await products.deleteOne({_id : id})
         if(del){
            res.redirect('/admin/products')
         }
         
      }catch(err){
         console.log(err);
      }
   }


}