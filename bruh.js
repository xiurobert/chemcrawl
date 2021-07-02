const express = require("express");
const bruhg = express();

let conf;
if (process.env.NODE_ENV === 'development') {
    conf = require("./config.dev.json");
} else {
    conf = require("./config.json");
}

module.exports = {
    app: bruhg,
    config: conf
};