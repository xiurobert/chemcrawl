const {mongo_client, config} = require("./bruh");
const bcrypt = require('bcrypt');
const logging = require('./logging');

let username = process.argv.slice(2)[0];
let password = process.argv.slice(2)[1];

mongo_client.connect().then(() => {
    const db = mongo_client.db(config.db.name);
    const coll = db.collection("admins");
    console.log("here 1");
    bcrypt.hash(password, 4).then(hashed => {
        console.log('here 2');
        coll.insertOne({
            "username": username,
            "password": hashed
        }).then(res => {
            console.log(`${logging.prefix} ${logging.levels.info} Created user: ${res.insertedId}`);
            process.exit(0)
        }).catch(err => {
            console.log(`${logging.prefix} ${logging.levels.err} Error creating user`);
            process.exit(1);
        })
    })

})