const mango = require("mongodb");
const nocache = require("nocache");
const app = require("./bruh").app;
const conf = require("./bruh").config;
const twing = require("./bruh").twing;

app.use(nocache());

app.use('/', require("./routes/home"));
app.use('/organic', require("./routes/organic"))
app.use('/admin', require("./routes/admin"));


app.listen(conf.server.port, () => {
    console.log(`[chemcrawl] Started express server on port ${conf.server.port}`)
});

