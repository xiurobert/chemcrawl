const express = require('express');
const {twing, config} = require("../bruh");
const router = express.Router();
const ash = require("express-async-handler");

router.get('/', ash(async (req, res) => {
    res.end(await twing.render('index.twig', {
        "app_name": config.app.name
    }));
}));

router.get('/suggest', function (req, res) {

});

router.post('/suggest', function (req, res) {

});

module.exports = router;