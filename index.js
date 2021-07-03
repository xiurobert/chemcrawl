const mango = require("mongodb");
const app = require("./bruh").app;
const conf = require("./bruh").config;

app.listen(conf.server.port, () => {
    console.log(`[chemcrawl] Started express server on port ${conf.server.port}`)
});