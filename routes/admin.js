const express = require('express');
const bcrypt = require('bcrypt');
const {twing, config, mongo_client, db} = require("../bruh");
const router = express.Router();
const logging = require("../logging");
const chalk = require("chalk");
const mongo = require("mongodb");
const multer = require("multer");



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
                        req.session.loggedIn = true;
                        req.session.userId = res["_id"];
                        res.redirect('/admin/dashboard');
                    }
                })
            }
        })
    })
});

router.get('/dashboard', (req, res) => {
    res.end('dashboard');
})

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

router.get('/addexample/:type/:target_id', (req, res) => {
    twing.render('admin/add_example.twig', {
        "app_name": config.app.name,
        "type": req.params['type'],
        "target_id": req.params['target_id']
    }).then(output => res.end(output));
})

router.post('/addexample/:type/:target_id', multer({dest: `${__dirname}/../upload-tmp`}).single('file'),
    (req, res) => {
    let targetId;
    try {
        targetId = mongo.ObjectId(req.params['target_id']);
    } catch {
        console.log(`${logging.prefix} ${logging.levels.warn} Someone just tried to access an invalid objectid: ${req.params['rxnId']}`);
        res.end("That is not a valid objectid");
    }
    mongo_client.connect().then(() => {
        const db = mongo_client.db(config.db.name);
        if (req.params['type'].toLowerCase() === 'organic') {

        }
    })

})

module.exports = router;