const express = require('express');
const {twing, config} = require("../bruh");
const router = express.Router();

router.get('/', function (req, res){
    twing.render('index.twig', {
        "app_name": config.app.name
    }).then(output => res.end(output));
});

router.get('/suggest', function (req, res) {

});

router.post('/suggest', function (req, res) {

})

module.exports = router;