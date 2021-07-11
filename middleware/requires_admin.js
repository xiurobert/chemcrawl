const {mongo_client, config} = require('../bruh');
const mongo = require("mongodb");
const logging = require("../logging");

function requires_admin(req, res, next) {
    if (req.session && req.session.userId && req.session.isAdmin) {
        return next();
    } else {
        res.status(403);
        return res.end("Not logged in");
    }
}

module.exports.requires_admin = requires_admin;