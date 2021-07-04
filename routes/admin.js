const express = require('express');
const {twing, config} = require("../bruh");
const router = express.Router();

router.get('/addrxn', (req, res) => {
    twing.render('admin/add_rxn.twig', {
        "app_name": config.app.name
    }).then(output => res.end(output));
})

router.post('/addrxn', (req, res) => {

})

module.exports = router;