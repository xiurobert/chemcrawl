const express = require("express");
const bruhg = express();
const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');

let twing

let conf;
if (process.env.NODE_ENV === 'development') {
    conf = require("./config.dev.json");
    twing = new TwingEnvironment(new TwingLoaderFilesystem('./views'), {
        debug: true,
        cache: false,
        auto_reload: true
    });
} else {
    conf = require("./config.json");
    twing = new TwingEnvironment(new TwingLoaderFilesystem('./views'));
}

// express setup
bruhg.use(express.static('public'));

module.exports = {
    app: bruhg,
    config: conf,
    twing: twing
};