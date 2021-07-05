const {mongo_client, config} = require('../bruh');
const mongo = require("mongodb");
const logging = require("../logging");

module.exports = () => {
    return (req, res, next) => {
        mongo_client.connect().then(() => {
            const db = mongo_client.db(config.db.name);
            const collection = db.collection("admins");

            collection.findOne(mongo.ObjectId(req.session)).then((result) => {
                if (!result) {
                    let err = new Error("Not logged in");
                    err.status = 403;
                    return next(err);
                }
            }).catch(err => {
                console.log(`${logging.prefix} ${logging.levels.err} ${err.stack}`)
                res.status = 500;
                return next()
            })
        }).catch(err => {
            console.log(`${logging.prefix} ${logging.levels.err} Error connecting to db`);
            return next();
        })
    }
}