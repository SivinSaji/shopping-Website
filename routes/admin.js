var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true,products});       
  })
 
});
router.get('/add-product',function(req,res){
  res.render('admin/add-product')
})
router.post('/add-product',(req,res)=>{
   productHelpers.addProduct(req.body,(id)=>{
  
    let image=req.files.Image
    console.log(id)
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-product')
      }else{
        console.log(err);
      }
    })
  res.render('admin/add-product')
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id   //Here we pass the product id in url and in get method we can use it by params
  console.log(proId)
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })

})
module.exports = router;