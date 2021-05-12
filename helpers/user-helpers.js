var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt = require("bcrypt");
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
                        console.log("Login success")
                        response.user = user
                        response.status= true
                        resolve(response)
                        
             }else{
                        console.log("Login Faild")
                         resolve({status:false})
                    }
                })
            }else{
                console.log("Incorrect email")
                resolve({status:false})
            }
        })
    }
}