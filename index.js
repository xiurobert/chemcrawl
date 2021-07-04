const mango = require("mongodb");
const nocache = require("nocache");
const app = require("./bruh").app;
const conf = require("./bruh").config;
const twing = require("./bruh").twing;

app.use(nocache());

app.get('/', function (req, res){
    twing.render('index.twig', {
        "app_name": conf.app.name
    }).then(output => res.end(output));
});

app.get('/suggest', function (req, res) {

});

app.post('/suggest', function (req, res) {

})


app.listen(conf.server.port, () => {
    console.log(`[chemcrawl] Started express server on port ${conf.server.port}`)
});

