const {mongo_client, config} = require("./bruh");
const bcrypt = require('bcrypt');
const logging = require('./logging');
const chalk = require('chalk');

if (process.argv.slice(2).length !== 2) {
    console.log(`${logging.levels.err} Insufficient arguments`);
    process.exit(1);
}

let username = process.argv.slice(2)[0];
let password = process.argv.slice(2)[1];

console.log(`Using username ${chalk.cyan(username)} and password ${chalk.redBright(password)}`);

mongo_client.connect().then(() => {
    const db = mongo_client.db('chemcrawl_test');
    const coll = db.collection("admins");

    coll.find({username: username}).toArray().then(res => {

        if (res && res.length >= 1) {
            // user exists
            console.log(`${logging.levels.err} User exists`);
            process.exit(1)
        }
        bcrypt.hash(password, 4).then(hashed => {
            coll.insertOne({
                "username": username,
                "password": hashed
            }).then(res => {
                console.log(`${logging.prefix} ${logging.levels.info} Created user: ${chalk.yellow(res.insertedId)}`);
                process.exit(0)
            }).catch(err => {
                console.log(`${logging.prefix} ${logging.levels.err} Error creating user`);
                process.exit(1);
            })
        })
    })



})