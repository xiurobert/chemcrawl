const express = require('express');
const {twing, config, mongo_client} = require("../bruh");
const router = express.Router();
const mongo = require("mongodb");
const logging = require('../logging');

router.get('/rxnlist', function (req, res) {
    mongo_client.connect().then(() => {
        const db = mongo_client.db(config.db.name);
        const coll = db.collection('organic_reactions');

        async function do_things() {
            return await coll.find().toArray()
        }

        do_things().then((stuff) => {
            twing.render('organic/list.twig', {
                "app_name": config.app.name,
                "result": stuff
            }).then(output => res.end(output));
        }).catch((err) => {
            console.log(`${logging.prefix} ${logging.levels.err} ${err.trace}`)
        })

    })
});

router.get('/rxn/:rxnId', function(req, res) {
    let rxnId;
    try {
        rxnId = mongo.ObjectId(req.params['rxnId']);
        mongo_client.connect().then(() => {
            const db = mongo_client.db(config.db.name);
            const coll = db.collection('organic_reactions');
            coll.findOne({'_id': rxnId}).then((result) => {
                twing.render('organic/rxn_info.twig', {
                    "app_name": config.app.name,
                    "result": result
                }).then(output => res.end(output));
            })

        })
    } catch {
        console.log(`${logging.prefix} ${logging.levels.warn} Someone just tried to access an invalid objectid: ${req.params['rxnId']}`)
        res.end("That is not a valid objectid")
    }


})


module.exports = router;