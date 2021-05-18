var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt = require("bcrypt");
var objectId=require('mongodb').ObjectId
const { ObjectId } = require('mongodb');
const { response } = require('express');
//const collections = require('../config/collections');
module.exports={
    doSignup: (userData) => {  //here userData is re.body which is passed from user.js
        return new Promise(async (resolve, reject) => {
          userData.Password = await bcrypt.hash(userData.Password, 10);
          db.get()
            .collection(collection.USER_COLLECTION)
            .insertOne(userData)
            .then((data) => {
              resolve(data.ops[0]);
            });
        });
      },
      doLogin : (userData) => {              //here userData is re.body which is passed from user.js
        return new Promise(async(resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password, user.Password).then((status)=>{
                    if(status){
                       //console.log("Login success")
                        response.user = user
                        response.status= true
                        resolve(response)
                        
             }else{
                        //console.log("Incorrect password")
                         resolve({status:false})
                    }
                })
            }else{
                 //console.log("Incorrect email")
                resolve({status:false})
            }
        })
    },
    addToCart:(proId,userId)=>{
      return new Promise(async(resolve,reject)=>{
        let userCart=await  db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(userCart){
          db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
        {
          
          $push:{products:ObjectId(proId)}
         
        }
      
     ).then((response)=>{
       resolve()
    })
    
    }else{
      let cartObj={
        user:objectId(userId),
        products:[objectId(proId)]
      }
      db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
        resolve()
      })
      }
    })
   },getCartProducts:(userId)=>{
     return new Promise(async(resolve,reject)=>{ 
       let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
         {
           $match:{user:objectId(userId)}
         },
         {
           $lookup:{
             from:collection.PRODUCT_COLLECTION,
             let:{prodList:'$products'},
             pipeline:[
               {
                 $match:{
                   $expr:{
                     $in:['$_id',"$$prodList"]
                   }
                 }
               }
             ],
             as:'cartItems'
           }
         }
       ]).toArray()
       resolve(cartItems[0].cartItems)
     })
   },
   getCartCount:(userId)=>{
     return new Promise(async(resolve,reject)=>{
       let count=0
       let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
       if(cart){
         count=cart.products.length
       }
       resolve(count)
     })
   }
}