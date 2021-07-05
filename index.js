const nocache = require("nocache");
const app = require("./bruh").app;
const conf = require("./bruh").config;

app.use(nocache());

app.use('/', require("./routes/home"));
app.use('/organic', require("./routes/organic"))
app.use('/admin', require("./routes/admin"));


app.listen(conf.server.port, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('[DEV MODE] Starting up...')
    }
    console.log(`[chemcrawl] Started express server on port ${conf.server.port}`)
});

