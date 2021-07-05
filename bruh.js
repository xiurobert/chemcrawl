const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const {MongoClient} = require("mongodb");
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

const client = new MongoClient(conf.db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

module.exports = {
    app: app,
    config: conf,
    twing: twing,
    mongo_client: client
};