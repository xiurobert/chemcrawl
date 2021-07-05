const express = require('express');
const bcrypt = require('bcrypt');
const {twing, config, mongo_client, db} = require("../bruh");
const router = express.Router();
const logging = require("../logging");
const chalk = require("chalk");

router.get('/login', (req, res) => {
    twing.render('admin/login.twig', {
        "app_name": config.app.name
    }).then(output => res.end(output));
})

router.post('/login', (req, res) => {
    mongo_client.connect().then(() => {
        const db = mongo_client.db(config.db.name)
        const coll = db.collection("admins");
        coll.findOne({'username': req.body["username"]}).then(res => {
            // res['password']
            if (!res) {
                // no user found
                res.status = 400;
                res.end('No such username');
            } else {
                bcrypt.compare(req.body["password"], res["password"]).then(result => {
                    if (result) {

                    }
                })
            }
        })
    })
});

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
        subType: ["Addition", "Substitution"].includes(req.body["rxnType"])  ? req.body["rxnSubType"] : null,
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
            console.log(
                `${logging.prefix} ${logging.comp.db} Created ORG_RXN ${chalk.greenBright(result.insertedId)}`);
            res.redirect(`/organic/rxn/${result.insertedId}`);
        })
        
    })

})

module.exports = router;