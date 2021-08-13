const { Router } = require('express');
var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
//const userHelpers=require('../helpers/user-helpers')
  const verifyLogin=(req,res,next)=>{
    if(req.session.adminLoggedIn){
      next()
    }else{
       res.redirect('/admin/login')
    }
  }
/* GET users listing. */
router.get('/',verifyLogin, async function(req, res, next) {
  let adminDetails=req.session.admin
  console.log(adminDetails);
  let products= await productHelpers.getAllProducts()
  productHelpers.viewAllProducts().then((categories)=>{
    console.log(products);
    res.render('admin/view-products',{admin:true,categories,products,adminDetails});       
  })
 
});

router.get("/signup", function (req, res) {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    let adminDetails=req.session.admin
    res.render("admin/signup", {admin: true,signUpErr: req.session.signUpErr ,adminDetails}); 
    req.session.signUpErr=false
  }
})

router.post("/signup", function (req, res) { 
  productHelpers.doSignup(req.body).then((response) => {
    //console.log(req.body);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Admin Code";
      res.redirect("/admin/signup");
    }else if(response.status==true){
        req.session.signUpErr = "Email Id already exist";
        res.redirect("/admin/signup");
      }
    else {
      req.session.admin = response;
      req.session.adminLoggedIn = true;
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


router.get('/add-product',verifyLogin,function (req,res){
  let adminDetails=req.session.admin
  productHelpers.getAllCategory().then((category)=>{
    console.log("$$$$$");
    console.log(category);
  res.render('admin/add-product',{admin:true,adminDetails,category})
})
})


router.post('/add-product',verifyLogin ,(req,res)=>{
   productHelpers.addProduct(req.body,async(id)=>{
    let adminDetails=req.session.admin
    let category=await productHelpers.getAllCategory()
    let image=req.files.Image
    
    console.log(id)
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        console.log("%%%%%%%%%");
        console.log(category);
        console.log(adminDetails);
        res.render('admin/add-product',{admin:true,adminDetails,category})
      }else{
        console.log(err);
      }
    })
  })
})


router.get('/delete-product/:id',verifyLogin,(req,res)=>{
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

router.post('/edit-product/:id',verifyLogin,(req,res)=>{
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

  router.get('/remove-user/:id',verifyLogin,(req,res)=>{
    let userId=req.params.id
    console.log(userId);
    productHelpers.deleteUser(userId).then((response)=>{
    res.redirect('/admin/all-users')
    })
  })

  router.get('/remove-all-users',verifyLogin,(req,res)=>{
    productHelpers.deleteAllUsers().then((response)=>{
      res.redirect('/admin/all-users')
    })
  })

  router.get('/all-orders',verifyLogin,async(req,res)=>{
    let adminDetails=req.session.admin
    let orders= await productHelpers.getAllOrders()
    let users=await productHelpers.getAllusers()

    console.log(users);
    console.log(orders);
      res.render('admin/all-orders',{orders,users,admin:true,adminDetails})
  })

  router.get('/view-ordered-products/:id',verifyLogin,async(req,res)=>{
    let adminDetails=req.session.admin
    let orderId=req.params.id;
    console.log(orderId);
    let orderItems=await productHelpers.getOrderedProducts(orderId)
    res.render('admin/view-ordered-products',{orderItems,admin:true,adminDetails})
    console.log(orderItems)
  })

  router.get('/change-status',verifyLogin,(req,res)=>{
    let status=req.query.status
    let orderId=req.query.orderId
    productHelpers.changeStatus(orderId,status)
    res.redirect('/admin/all-orders')
  })
router.get('/all-categories',verifyLogin,async(req,res)=>{
  let adminDetails=req.session.admin
  let categories=await productHelpers.getAllCategory()
  res.render('admin/all-categories',{admin:true,adminDetails,categories})
})

router.get('/add-category',verifyLogin,(req,res)=>{
  let adminDetails=req.session.admin
  res.render('admin/add-category',{admin:true,adminDetails})
})



  router.post('/add-category',verifyLogin,function(req,res){
    productHelpers.addNewCategory(req.body).then((id)=>{
    let image=req.files.image
     console.log(id);
     image.mv('./public/category-images/'+id+'.jpg',function(err,done){
      if(!err){
        res.redirect('/admin/add-category')
      }else{
        console.log(err);
      }
    })

   })
 }),
 router.get('/edit-category/:id',verifyLogin,async(req,res)=>{
  let categoryId=req.params.id;
  let category=await productHelpers.CategoryDetails(categoryId)
  res.render('admin/edit-category',{category})
  console.log("%%%%%%%%%%%");
  console.log(category);
 })
router.post('/edit-category/:id',verifyLogin,(req,res)=>{
  console.log('$$$$$$$$$$$$');
  console.log(req.body);
  productHelpers.editCategory(req.body,req.params.id).then(()=>{
    res.redirect('/admin/all-categories')
    let id=req.params.id
    let image=req.files.Image
    console.log(id)
    image.mv('./public/category-images/'+id+'.jpg')
  })

}),

router.get('/delete-category/:id',verifyLogin,(req,res)=>{
     console.log(req.params.id);
  productHelpers.deleteCategory(req.params.id).then(()=>{
    res.redirect('/admin/all-categories')
  })
})
 module.exports = router;

    