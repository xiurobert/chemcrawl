const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const {MongoClient} = require("mongodb");
const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');
const session = require('express-session');
const MongoStore = require('connect-mongo');

let twing;

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

const client = new MongoClient(conf.db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

client.connect().then(r => {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({
        secret: conf.app.sess_secret,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            client,
            dbName: conf.db.name
        })
    }))
    app.use('/public', express.static('public'));
});


module.exports = {
    app: app,
    config: conf,
    twing: twing,
    mongo_client: client,
};