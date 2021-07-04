const express = require('express');
const {twing, config} = require("../bruh");
const router = express.Router()

router.get('/rxnlist', function (req, res) {
    twing.render('organic/list.twig', {
        "app_name": config.app.name
    }).then(output => res.end(output));
});


module.exports = router;