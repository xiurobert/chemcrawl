const express = require('express');
const {twing, config, mongo_client} = require("../bruh");
const router = express.Router();
const mongo = require("mongodb");
const logging = require('../logging');
const ash = require("express-async-handler")

router.get('/rxn-list/:sortBy-:sortOrder',  ash(async(req, res) => {
    const sortBy = req.params["sortBy"];
    const sortOrder = req.params["sortOrder"];

    const hack = {
        "asc": 1,
        "dsc": -1
    }

    if (!["abc", "type", "reagents", "conditions"].includes(sortBy.toLowerCase())) {
        res.status(400).end("Invalid sort criterion");
    }

    if (!["asc", "dsc"].includes(sortOrder.toLowerCase())) {
        res.status(400).end("Invalid sort order");
    }

    await mongo_client.connect();
    const coll = mongo_client.db(config.db.name).collection('organic_reactions');

    let all_da_stuff = await coll.find();
    let dae_return;
    if (sortBy.toLowerCase() === 'abc') {
        dae_return = all_da_stuff.sort({name: -1}).toArray();
    }
    res.end(await twing.render('organic/list.twig', {
        "app_name": config.app.name,
        "result": dae_return
    }));
}));

router.get('/rxn/:rxnId', ash(async(req, res) => {
    let rxnId;
    try {
        rxnId = mongo.ObjectId(req.params['rxnId']);
    } catch {
        console.log(`${logging.prefix} ${logging.levels.warn} Someone just tried to access an invalid objectid: ${req.params['rxnId']}`)
        res.end("That is not a valid objectid")
    }
    await mongo_client.connect();
    const db = mongo_client.db(config.db.name);
    const coll = db.collection('organic_reactions');
    // const grid = new mongo.GridFSBucket(db);

    res.end(await twing.render('organic/rxn_info.twig', {
        "app_name": config.app.name,
        "result": await coll.findOne({'_id': rxnId})
    }));
}));


module.exports = router;