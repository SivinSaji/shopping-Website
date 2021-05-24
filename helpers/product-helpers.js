var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={

    addProduct:(product,callback)=>{


    db.get().collection('product').insertOne(product).then((data)=>{
      
      callback(data.ops[0]._id)
      
    })
    },
    getAllProducts:()=>{
      return new Promise(async(resolve,rejct)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        resolve(products)
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
    }

}
