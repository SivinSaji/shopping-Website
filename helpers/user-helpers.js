var db=require('../config/connection')
//var collection=require('../config/collections')
const bcrypt = require("bcrypt");
const collections = require('../config/collections');
module.exports={
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
          userData.password = await bcrypt.hash(userData.password, 10);
          db.get()
            .collection(collections.USER_COLLECTION)
            .insertOne(userData)
            .then((data) => {
              resolve(data.ops[0]);
            });
        });
      }
}