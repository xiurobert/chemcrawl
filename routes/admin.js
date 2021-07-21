const express = require('express');
const bcrypt = require('bcrypt');
const chalk = require("chalk");
const mongo = require("mongodb");
const {ObjectId} = require("mongodb")
const multer = require("multer");
const {GridFsStorage} = require("multer-gridfs-storage");
const ash = require("express-async-handler");
const bodyParser = require("body-parser");

const logging = require("../logging");
const path = require("path");
const {twing, config, mongo_client, db} = require("../bruh");
const {requires_admin} = require("../middleware/requires_admin");


const router = express.Router();
const storage = new GridFsStorage({
    url: `${config.db.uri}/${config.db.name}`,
});
const upload = multer({
    storage: storage,
    fileFilter: (_req, file, cb) => {
        const allowed_ExtensionsAndMimeTypes = {
            ".png": "image/png",
            ".svg": "image/svg+xml",
            ".jpeg": "image/jpeg",
            ".jpg": "image/jpg",
            ".gif": "image/gif",
            ".md": "text/markdown",
            ".txt": "text/plain",
            ".pdf": "application/pdf",
            ".mp4": "video/mp4"
        }
        // this monstrosity just compares the extensions and mimetypes and ensure the user is not lying and trying to upload a virus or something
        if (
            Object.keys(allowed_ExtensionsAndMimeTypes).includes(path.extname(file.originalname).toLowerCase())
            && allowed_ExtensionsAndMimeTypes[path.extname(file.originalname).toLowerCase()] === file.mimetype.toLowerCase()
        ) {
            return cb(null, true);
        } else {
            cb("Error: File was not in the allowed list of file types");
        }
    }
});


router.get('/login', ash(async(req, res) => {
    res.end(await twing.render('admin/login.twig', {
        "app_name": config.app.name
    }));
}));

router.post('/login', bodyParser.urlencoded({ extended: true }),
    ash(async (req, res) => {
    await mongo_client.connect();
    const db = mongo_client.db(config.db.name);
    const coll = db.collection("admins");
    let result = await coll.findOne({'username': req.body["username"]});
    if (!result) {
        res.status(400);
        res.end('No such username');
    } else {
        console.log(`${logging.prefix} ${logging.levels.debug} User logging in: ${req.body["username"]}`);
        if (await bcrypt.compare(req.body["password"], result["password"])) {
            req.session.loggedIn = true;
            req.session.userId = res['_id'];
            req.session.isAdmin = true;
            console.log(`${logging.prefix} ${logging.levels.debug} Logged in user: ${req.body["username"]}`);
            res.redirect('/admin/dashboard');
        }
    }
}));

router.get('/dashboard', requires_admin, (req, res) => {
    res.end('dashboard');
});

router.get('/addrxn', (req, res) => {
    twing.render('admin/add_rxn.twig', {
        "app_name": config.app.name
    }).then(output => res.end(output));
});

router.post('/addrxn', (req, res) => {
    // todo replace with async await
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

});

router.get('/add-test', ash(async(req, res) => {
    res.end(await twing.render('admin/add_test.twig', {
        "app_name": config.app.name
    }));
}));
router.post('/add-test', ash(async(req, res) => {
    let data = {
        name: req.body["testName"],
        conditions: [],
        reagents: [],
        reactants: [],
        products: [],
        positiveOutcome: req.body["positiveOutcome"],
        negativeOutcome: req.body["negativeOutcome"]
    }

    let key = "";
    for (key in req.body) {
        if (key.startsWith('testConditions')) {
            data.conditions.push(req.body[key]);
        } else if (key.startsWith('testReagents')) {
            data.reagents.push(req.body[key]);
        } else if (key.startsWith('testReactants')) {
            data.reactants.push(req.body[key]);
        } else if (key.startsWith('testProducts')) {
            data.products.push(req.body[key]);
        }
    }

    await mongo_client.connect();
    const db = mongo_client.db(config.db.name);
    const coll = db.collection('distinguishing_tests');

    let result = await coll.insertOne(data);
    console.log(`${logging.prefix} ${logging.comp.db} Created D_TEST ${chalk.greenBright(result.insertedId)}`);
    res.redirect(`/test/${result.insertedId}`);
}))

router.get('/addexample/:type/:target_id',
    (req, res) => {
        // todo replace with async await
        twing.render('admin/add_example.twig', {
            "app_name": config.app.name,
            "type": req.params['type'],
            "target_id": req.params['target_id']
        }).then(output => res.end(output));
    });

router.post('/addexample/:type/:target_id', upload.single('file'),
    ash(async(req, res) => {

        let targetId;
        try {
            targetId = ObjectId(req.params['target_id']);
        } catch {
            console.log(`${logging.prefix} ${logging.levels.warn} Invalid OID submitted: ${req.params['target_id']}`);
            res.status(400)
            res.end("That is not a valid objectid");
        }
        await mongo_client.connect();
        const db = mongo_client.db(config.db.name);
        const coll = db.collection('organic_reactions');


        if (req.params['type'].toLowerCase() === 'organic') {
            console.log(`${logging.prefix} ${logging.levels.debug} File ObjectID: ${req.file.id}`)
            let target = await coll.findOne({'_id': targetId});

            if (!target) {
                res.status(404)
                res.end('That object does not exist');
            } else {
                const result = await coll.updateOne({'_id': targetId}, {
                    $addToSet: {
                        examples: {
                            'fileId': req.file.id,
                            'contentType': req.file.contentType
                        }
                    }
                });
                console.log(`${logging.prefix} ${logging.levels.debug} Updated: ${result.modifiedCount}`)
                res.status(200).end('Added the example');
            }
        } else {
            res.status(400);
            res.end("Not supported");
        }

    }));

module.exports = router;