const express = require('express');
const {twing, config, mongo_client} = require("../bruh");
const router = express.Router();
const mongo = require("mongodb");
const logging = require('../logging');
const ash = require("express-async-handler")

router.get('/rxnlist',  ash(async(req, res) => {
    await mongo_client.connect();
    const coll = mongo_client.db(config.db.name).collection('organic_reactions');
    res.end(await twing.render('organic/list.twig', {
        "app_name": config.app.name,
        "result": await coll.find().toArray()
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
    const coll = mongo_client.db(config.db.name).collection('organic_reactions');
    res.end(await twing.render('organic/rxn_info.twig', {
        "app_name": config.app.name,
        "result": await coll.findOne({'_id': rxnId})
    }));
}));


module.exports = router;