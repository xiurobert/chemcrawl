const mango = require("mongodb");
const nocache = require("nocache");
const app = require("./bruh").app;
const conf = require("./bruh").config;
const twing = require("./bruh").twing;

app.use(nocache());

app.get('/', function (req, res){
    twing.render('index.twig',).then(output => res.end(output));
});


app.listen(conf.server.port, () => {
    console.log(`[chemcrawl] Started express server on port ${conf.server.port}`)
});

