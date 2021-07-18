const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const {MongoClient} = require("mongodb");
const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const logging = require("./logging");

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: conf.app.sess_secret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: conf.db.uri,
        dbName: conf.db.name,
        mongoOptions: {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
    })
}))
app.use('/public', express.static('public'));

// errors

app.use((err, req, res, next)  => {
    console.error(`${logging.prefix} ${logging.levels.err} ${err.stack}`);
    // res.send(err.body);
})

// TODO: apparently we should be passing a connection around instead of the client

module.exports = {
    app: app,
    config: conf,
    twing: twing,
    mongo_client: client,
};