var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
/* GET home page. */
router.get('/', function(req, res, next) {
  
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{products});       
  })
});
router.get("/login", function (req, res) {
  res.render('user/login')
})
router.get("/signup", function (req, res) {
  res.render("user/signup");  
})
router.post("/signup", function (req, res) {
  
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response)
  })
})
module.exports = router;
