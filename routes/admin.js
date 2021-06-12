const { Router } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
//const userHelpers=require('../helpers/user-helpers')
  const verifyLogin=(req,res,next)=>{
    if(req.session.adminLoggedIn){
      next()
    }else{
       res.redirect('admin/login')
    }
  }
/* GET users listing. */
router.get('/',verifyLogin,function(req, res, next) {
  let adminDetails=req.session.admin
  console.log(adminDetails);
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true,products,adminDetails});       
  })
 
});

router.get("/signup", function (req, res) {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/signup", {
      admin: true,
      signUpErr: req.session.signUpErr,
    }); 
  }
})
router.post("/signup", function (req, res) {
  
  productHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Admin Code";
      res.redirect("/admin/signup");
    } else {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    }
  });
})

router.get("/login",function(req,res) {
  
  if(req.session.adminLoggedIn){
    console.log(req.session.admin)
    res.redirect('/admin')
  }else{
    let adminDetails=req.session.admin
     res.render('admin/login',{"loginErr":req.session.adminLoginErr,admin:true,adminDetails})
     req.session.adminLoginErr=null
  }
})
router.post('/login',(req,res)=>{
  productHelpers.doLogin(req.body).then((response)=>{
    console.log(response);
    if(response.status){
      req.session.admin=response.admin
      req.session.adminLoggedIn=true

    res.redirect('/admin')
    }else{
      req.session.adminLoginErr="Invalid username or password"
      res.redirect('/admin/login')
    }
  })
 })
router.get('/logout',(req,res)=>{
  req.session.adminLoggedIn=false
  req.session.admin=null
  res.redirect('/admin')
})


router.get('/add-product',function(req,res){
  let adminDetails=req.session.admin
  res.render('admin/add-product',{admin:true,adminDetails})
})
router.post('/add-product',verifyLogin,(req,res)=>{
   productHelpers.addProduct(req.body,(id)=>{
  
    let image=req.files.Image
    //console.log(id)
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


//Here we show the edit products in edit-product.hbs
router.get('/edit-product/:id',verifyLogin,async(req,res)=>{
  let adminDetails=req.session.admin
  let product=await productHelpers.getProductDetalis(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{product,admin:true,adminDetails})
})

router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id);
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    let id=req.params.id
    let image=req.files.Image
    console.log(id)
    image.mv('./public/product-images/'+id+'.jpg')
    })
  })

  router.get('/all-users',verifyLogin,async(req,res)=>{
    let adminDetails=req.session.admin
    productHelpers.getAllusers().then((users)=>{
      res.render('admin/all-users',{admin:true,users,adminDetails});       
    })
  })

  router.get('/remove-user/:id',(req,res)=>{
    let userId=req.params.id
    console.log(userId);
    productHelpers.deleteUser(userId).then((response)=>{
    res.redirect('/admin/all-users')
    })
  })

  router.get('/remove-all-users',(req,res)=>{
    productHelpers.deleteAllUsers().then((response)=>{
      res.redirect('/admin/all-users')
    })
  })
module.exports = router;

