var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt = require("bcrypt");
var objectId=require('mongodb').ObjectId;
const { response } = require('express');
const { ObjectId } = require('bson');
module.exports={

    addProduct:(product,callback)=>{
    product.Price=parseInt(product.Price)
    product.category = objectId(product.category)
    db.get().collection('product').insertOne(product).then((data)=>{
        callback(data.ops[0]._id)
      
    })
    },
   getAllProducts:()=>{
      return new Promise(async(resolve,rejct)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        resolve(products)
        console.log(products);
      })
    },
     
    viewAllProducts:async()=>{
      return new Promise (async(resolve,reject)=>{
     let categories= await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
       {
         $lookup:{
           from:collection.PRODUCT_COLLECTION,
           localField:'_id',
           foreignField:'category',
           as:'product'

         }

       },
     ]).toArray()
     resolve(categories)
    })
    
    },

    deleteProduct:(prodId)=>{  
         return new Promise((resolve,reject)=>{
           db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(prodId)}).then((response)=>{
             
             resolve(response)
           })
         })
    },
    getProductDetalis:(proId)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
          resolve(product)
        })
      })
    },
    updateProduct:(proId,proDetails)=>{
      proDetails.Price=parseInt(proDetails.Price)
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
          $set:{
            Name:proDetails.Name,
            Description:proDetails.Description,
            Category:proDetails.Category,
            Price:proDetails.Price,
           }
        }).then((response)=>{
          resolve()
        })
      })
    },
    doSignup: (adminData) => {  //here userData is req.body which is passed from user.js
      return new Promise(async (resolve, reject) => {
        let emailExist=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
        //console.log(adminData);
       // adminkey="$2b$10$xD/XN0eDxmDads.spe0zIusN..zWz1fbsDAhevLZpRxt8YrQOvzkW";
      // bcrypt.compare(adminData.Password,).then((status)=>{
        console.log(emailExist);
        if(emailExist){
          resolve({ status:true});
        }else{
        
        if (adminData.Code==="sivin123") {
          
          let  date= new Date()
          console.log(date.toLocaleString('en-US', {
          weekday: 'short', // "Sat"
          month: 'long', // "June"
          day: '2-digit', // "01"
          year: 'numeric' // "2019"
          }))
          console.log(date.toDateString())
          console.log(date.toLocaleTimeString())
          adminData.Password = await bcrypt.hash(adminData.Password, 10);
          adminData.Code= await bcrypt.hash(adminData.Code, 10);
          adminData.Date = await date.toDateString()+' Time: '+date.toLocaleTimeString()
         // adminData.Password = await bcrypt.hash(adminData.Password, 10);
          db.get()
            .collection(collection.ADMIN_COLLECTION)
            .insertOne(adminData)
            .then((data) => {
              resolve(data.ops[0]);
            });
        } else {
          resolve({ status: false });
        }
      }
      });
    },
    doLogin : (adminData) => {              //here userData is re.body which is passed from user.js
      return new Promise(async(resolve, reject) => {
          let loginStatus = false
          let response = {}
          let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
          if(admin){
              bcrypt.compare(adminData.Password, admin.Password).then((status)=>{
                  if(status){
                     //console.log("Login success")
                      response.admin = admin
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
  getAllusers:()=>{
    return new Promise(async(resolve,rejct)=>{
      let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
      resolve(users)
    })
  },
  deleteUser:(userId)=>{
    console.log(userId);
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.USER_COLLECTION).removeOne({_id:objectId(userId)}).then((response)=>{
        
        resolve(response)
      })
    })

  },
  deleteAllUsers:()=>{
    return new Promise((resolve,reject)=>{
    db.get().collection(collection.USER_COLLECTION).drop().then((response)=>{
      resolve(response)
    })
  })
  },
  getAllOrders:()=>{
    return new Promise((resolve,reject)=>{
      let orders=db.get().collection(collection.ORDER_COLLECTION).find().toArray()
      resolve(orders)
    })
  },
  getOrderedProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
     let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
       {
         $match:{_id:objectId(orderId)}
       },
       {
         $unwind:'$products'
       },
       {
         $project:{
           item:'$products.item',
           quantity:'$products.quantity'
         }
       },
       {
         $lookup:{
           from:collection.PRODUCT_COLLECTION,
           localField:'item',
           foreignField:'_id',
           as:'product'
         }
       },
       {
         $project:{
           item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
         }
       }
     ]).toArray()
     console.log(orderItems);

        resolve(orderItems)
      
    })
  },
  changeStatus:(orderId,status)=>{
    return new Promise((resolve,reject)=>{
       db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
         $set:{
           status:status
         }
       }).then((response)=>{
         resolve()
       })
    })
  },
  addNewCategory:(Category)=>{
    return new Promise((resolve,reject)=>{
    db.get().collection(collection.CATEGORY_COLLECTION).insertOne(Category).then((data)=>{
    resolve(data.ops[0]._id)
    console.log("^^^^^^^^^^^^^^^^^^")
    console.log(data.ops[0]._id);
})
    })
 },
   getAllCategory:()=>{
     return new Promise((resolve,reject)=>{
     let category=db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
     resolve(category)
    })
   },
   CategoryDetails:(Id)=>{
     return new Promise((resolve,reject)=>{
    let category=  db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(Id)})
    resolve(category)
     })
   },

   editCategory:(categoryData,categoryId)=>{
     return new Promise(async(resolve,rejct)=>{
     await  db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:ObjectId(categoryId)},{
         $set:{
           name:categoryData.name,
           displayName:categoryData.displayName

         }
       }).then((response)=>{
         resolve()
       })
     })
   },

   deleteCategory:(Id)=>{
     console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
     console.log(Id);
     return new Promise((resolve,reject)=>{
       db.get().collection(collection.CATEGORY_COLLECTION).removeOne({_id:ObjectId(Id)}).then((response)=>{
         resolve()
       })
     })
   },
   searchProduct:function(search) {
    return new Promise(async(resolve, reject) => {
       let searchResult = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
          {
             $lookup:
             {
                from:collection.CATEGORY_COLLECTION,
                localField:'category', 
                foreignField:'_id',
                as:'category'
             }
          },
          {
             $project:
             {
                Name:1, category:{$arrayElemAt:['$category',0]},Price:1, Description:1
             }
          },
          {
             $project:
             {
                Name:1, category:'$category.name',Price:1, Description:1
             }
          },
          {
             $match:
             {
                $or:[
                   {Name:{'$regex' : search, '$options' : 'i'}},
                   {category:{'$regex' : search, '$options' : 'i'}},
                ]
             }
          }
       ]).toArray()
       resolve(searchResult)
    })

},
getSelectedProduct:(productId)=>{
  return new Promise(async(resolve,reject)=>{
    let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)})
    resolve(product)
  })
},

/*Get the products in a specific category*/
getSelectedCategoryProducts:(categoryId)=>{
  return new Promise(async(resolve,reject)=>{
   let products=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
   
     {
       $match:{category:objectId(categoryId)}
     },
     {
       $project:{
        Name:1,Price:1,Description:1,category:'$category.name'
       }
     }
     
     
   ]).toArray()
   console.log(products);
     resolve(products)
    
  })
}

}
