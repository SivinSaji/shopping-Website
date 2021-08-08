var express = require('express');
const { Logger } = require('mongodb');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
var collection=require('../config/collections')
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
     res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log(user)
  let cartCount=null
  if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  
  productHelpers.viewAllProducts().then((categories)=>{
    console.log('$$$$$$$$');
    console.log(categories);   
    console.log(categories.product);  
    for(i=0;i<categories.length;i++){
      if(categories[i].product.length===0){
        delete categories[i]
      }
    }
    res.render('user/view-products',{categories,user,cartCount});    
   
  })
});

router.get("/login",function(req,res) {
  
  if(req.session.user){
    console.log(req.session.user)
    res.redirect('/')
  }else{
     res.render('user/login',{"loginErr":req.session.userLoginErr})
     req.session.userLoginErr=false
  }
})
router.get("/signup", function (req, res) {
  if(req.session.user){
  res.render("user/signup");  
  }else{
    res.render('user/signup',{"usersignUpErr":req.session.usersignUpErr})
     req.session.usersignUpErr=false
  }
})
router.post("/signup", function (req, res) {
  
  userHelpers.doSignup(req.body).then((response) => {
//console.log(req.body);
    //console.log(response)
    if(response.status==false){
      req.session.usersignUpErr="Email Id already exist"
      res.redirect('/signup')
    }else{
    req.session.user=response
    req.session.userLoggedIn=true 
    res.redirect('/')
    }
  })
})
router.post('/login' ,(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.userLoggedIn=true

    res.redirect('/')
    }else{
      req.session.userLoginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
 })
router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/cart',verifyLogin ,async(req,res,next)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0
  if(products.length>0){
  totalValue=await userHelpers.getTotalAmount(req.session.user._id) 
  }
  console.log(products)
  res.render('user/cart',{products,user:req.session.user._id,totalValue})
})


router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call");
  if(req.session.userLoggedIn)
  {
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
   res.json({status:true})
  })
  }
  else{
    res.json({status:false})
  }
 
  })

  router.post('/change-product-quantity',(req,res,next)=>{
    console.log(req.body);
    userHelpers.changeProductQuantity(req.body).then(async(response)=>{       
      response.total=await userHelpers.getTotalAmount(req.body.user)                        
      res.json(response)
    })
  })
//This is the function used to remove cart product written by my self
  router.post('/remove-cart-product',(req,res,next)=>{
    console.log(req.body);
    userHelpers.removeCartProduct(req.body).then((response)=>{                                  
      res.json(response)
    })
  })

  router.get('/place-order',verifyLogin,async(req,res)=>{
    let total=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/place-order',{total,user:req.session.user})
  })


  router.post('/place-order',async(req,res)=>{
    let products=await userHelpers.getCartProductList(req.body.userId)
    let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
      if(req.body['payment-method']==='COD'){
        res.json({codSuccess:true})
      }else{
        userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
          res.json(response)
        })
      }
    })
    console.log(req.body)
  })

  router.get('/order-success',(req,res)=>{
    res.render('user/order-success',{user:req.session.user})
  })
  router.get('/orders',async(req,res)=>{
    let orders=await userHelpers.getUserOrders(req.session.user._id)
    res.render('user/orders',{user:req.session.user,orders})
  })
  router.get('/view-order-products/:id',async(req,res)=>{
    let products=await userHelpers.getOrderProducts(req.params.id)
    console.log(products)
    res.render('user/view-order-products',{user:req.session.user,products})
  })
  router.post('/verify-payment',(req,res)=>{
    console.log(req.body);
    userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      
        res.json({status:true})

      })
    }).catch((err)=>{
      //console.log(err);
      res.json({status:false,errMsg:''})
    })
  })
/*Search products */

router.post('/search-products', function(req, res, next) {
  searchValue=req.body.searchValue;
  productHelpers.searchProduct(req.body.searchValue).then(async(products) => {
    searchResultLength=await products.length
    if(req.session.user){
      let user=req.session.user
    cartCount=await userHelpers.getCartCount(req.session.user._id)
    res.render('user/search-product', {products,searchValue,searchResultLength,cartCount,user})
    }
    else{
      res.render('user/search-product', {products,searchValue,searchResultLength})
    }
     
  })
})


/*Search products Start */

router.get('/search', function (req, res, next) {
	var q = req.query.q;
  console.log(q);
  productHelpers.searchProduct(q).then(async(data) => {
    console.log(data);
    res.json(data);
  })
});
/*Search products End*/


/*Product page*/
router.get('/product-page/:id', async(req,res)=>{
  let product=await productHelpers.getSelectedProduct(req.params.id)
  if(req.session.user){
    let user=req.session.user
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  res.render('user/product-page',{product,user:req.session.user,cartCount,user})
  }
  else{
    res.render('user/product-page',{product,user:req.session.user})
  }

})
module.exports = router;
 