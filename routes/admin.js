const express = require('express');
const {twing, config, mongo_client, db} = require("../bruh");
const router = express.Router();

router.get('/addrxn', (req, res) => {
    twing.render('admin/add_rxn.twig', {
        "app_name": config.app.name
    }).then(output => res.end(output));
})

router.post('/addrxn', (req, res) => {
    let key = "";

    let data = {
        name: req.body["rxnName"],
        type: req.body["rxnType"],
        needsMech: !!req.body["rxnNeedsMech"] ,
        subType: ["add", "sub"].includes(req.body["rxnType"])  ? req.body["rxnSubType"] : null,
        conditions: [],
        reagents: [],
        reactants: [],
        products: []
    }
    for (key in req.body) {
        if (key.startsWith('rxnConditions')) {
            data.conditions.push(req.body[key]);
        } else if (key.startsWith('rxnReagents')) {
            data.reagents.push(req.body[key]);
        } else if (key.startsWith('rxnReactants')) {
            data.reactants.push(req.body[key]);
        } else if (key.startsWith('rxnProducts')) {
            data.products.push(req.body[key]);
        }
    }
    mongo_client.connect().then(() => {
        const db = mongo_client.db(config.db.name);
        const coll = db.collection('organic_reactions');
        coll.insertOne(data).then((result) => {
            console.log(`${result.insertedCount} doc was inserted into organic_reactions, id: ${result.insertedId}`);
            res.send(`${result.insertedCount} doc was inserted into organic_reactions, id: ${result.insertedId}`);
        })
        
    })

})

module.exports = router;