const express = require('express');
const {twing, config} = require("../bruh");
const router = express.Router();
const ash = require("express-async-handler");
const mongo = require("mongodb");
const {mongo_client} = require("../bruh");
const md = require('markdown-it')();

router.get('/', ash(async (req, res) => {
    res.end(await twing.render('index.twig', {
        "app_name": config.app.name
    }));
}));

router.get('/suggest', ash(async (req, res) => {
    res.end(await twing.render('suggest_content.twig', {
        "app_name": config.app.name
    }));
}));

router.post('/suggest', ash(async(req, res) => {
    let name = req.body["name"];
    let suggestionE = req.body.suggestion;
    console.log("Name: " + name + ", Suggestion: " + suggestionE)
    res.redirect("/suggest/success")
}))

router.get('/suggest/success', ash(async (req, res) => {
    res.end(await twing.render('success.twig', {
        "app_name": config.app.name
    }));
}));

router.get('/read-markdown/:fileId', ash(async(req, res) => {
    function streamToString (stream) {
        const chunks = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        })
    }

    await mongo_client.connect();
    const db = mongo_client.db(config.db.name);
    const grid = new mongo.GridFSBucket(db);

    const file_cur = await grid.find({'_id': mongo.ObjectId(req.params['fileId'])});
    const count = await file_cur.count();


    if (count === 1) {
        const the_file = await file_cur.next();
        const dlStr = grid.openDownloadStream(the_file['_id']);
        if (the_file.contentType === 'text/markdown') {
            res.set({
                'Content-Type': 'text/html; charset=UTF-8'
            });
            const markdown = await streamToString(dlStr);
            res.send(md.render(markdown));

        } else {
            res.status(400).end("Example is not markdown")
        }

    } else {
        res.status(404).end("Example not found");
    }

}));


router.get('/read-example/:fileId', ash(
async(req, res) => {
    await mongo_client.connect();
    const db = mongo_client.db(config.db.name);
    const grid = new mongo.GridFSBucket(db);

    const file_cur = await grid.find({'_id': mongo.ObjectId(req.params['fileId'])});
    const count = await file_cur.count();


    if (count === 1) {
        const the_file = await file_cur.next();
        const dlStr = grid.openDownloadStream(the_file['_id']);
        if (the_file.contentType.startsWith("text")) {
            res.set({
                'Content-Type': 'text/plain; charset=UTF-8'
            });
        } else {
            res.set({
                'Content-Type': the_file.contentType,
                'Content-Disposition': 'inline'
            });
        }
        dlStr.pipe(res);

    } else {
        res.status(404).end("Example not found");
    }

}));


module.exports = router;