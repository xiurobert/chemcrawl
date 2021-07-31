const express = require("express");
const {twing, config} = require("../bruh");
const router = express.Router();
const ash = require("express-async-handler");
const mongo = require("mongodb");
const logging = require("../logging");
const {mongo_client} = require("../bruh");

router.get('/list/:sortBy-:sortOrder', ash(async (req, res) => {
    const sortBy = req.params["sortBy"].toLowerCase();
    const sortOrder = req.params["sortOrder"].toLowerCase();

    const map = {
        "asc": 1,
        "dsc": -1
    }

    if (!["abc", "reagents"].includes(sortBy)) {
        res.status(400).end("Invalid sort criterion");
    }

    if (!["asc", "dsc"].includes(sortOrder)) {
        res.status(400).end("Invalid sort order");
    }

    await mongo_client.connect();
    const coll = mongo_client.db(config.db.name).collection('distinguishing_tests');

    let stuff = await coll.find();
    let retVal;

    if (sortBy === 'abc') {
        retVal = await stuff.sort({name: map[sortOrder.toLowerCase()]}).toArray();
    } else if (sortBy === 'reagents') {
        // TODO: kinda complex
    }

    res.end(await twing.render('tests/list.twig', {
        "app_name": config.app.name,
        "result": retVal,
        "sortBy": sortBy,
        "sortOrder": sortOrder
    }));
}))

router.get('/test/:testId', ash(async (req, res) => {
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