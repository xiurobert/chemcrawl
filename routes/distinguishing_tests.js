const express = require("express");
const {twing, config} = require("../bruh");
const router = express.Router();
const ash = require("express-async-handler");
const mongo = require("mongodb");
const logging = require("../logging");
const {mongo_client} = require("../bruh");

router.get('/', ash(async (req, res) => {
    res.end(await twing.render('index.twig', {
        "app_name": config.app.name
    }));
}))

router.get('/:testId', ash(async (req, res) => {
    let testId;
    try {
        testId = mongo.ObjectId(req.params['testId']);
    } catch {
        console.log(`${logging.prefix} ${logging.levels.warn} Someone just tried to access an invalid objectid: ${req.params['testId']}`)
        res.end("That is not a valid objectid")
    }
    await mongo_client.connect();
    const db = mongo_client.db(config.db.name);
    const coll = db.collection('distinguishing_tests');
    // const grid = new mongo.GridFSBucket(db);

    res.end(await twing.render('tests/test_info.twig', {
        "app_name": config.app.name,
        "result": await coll.findOne({'_id': testId})
    }));
}));

module.exports = router;