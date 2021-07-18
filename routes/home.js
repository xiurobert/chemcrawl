const express = require('express');
const {twing, config} = require("../bruh");
const router = express.Router();
const ash = require("express-async-handler");
const mongo = require("mongodb");
const {mongo_client} = require("../bruh");

router.get('/', ash(async (req, res) => {
    res.end(await twing.render('index.twig', {
        "app_name": config.app.name
    }));
}));

router.get('/suggest', function (req, res) {

});

router.post('/suggest', function (req, res) {

});


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