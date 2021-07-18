const express = require("express");
const {twing, config} = require("../bruh");
const router = express.Router();
const ash = require("express-async-handler");
const mongo = require("mongodb");
const {mongo_client} = require("../bruh");

router.get('/', ash((req, res) => {

}))