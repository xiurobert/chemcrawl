const nocache = require("nocache");
const app = require("./bruh").app;
const conf = require("./bruh").config;
const chalk = require('chalk');
const logging = require("./logging");

app.use(nocache());

app.use('/', require("./routes/home"));
app.use('/organic', require("./routes/organic"));
app.use('/distinguishing-tests', require("./routes/distinguishing_tests"));
app.use('/admin', require("./routes/admin"));
app.use('/test', require("./routes/distinguishing_tests"));

app.listen(conf.server.port, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`${logging.prefix} > ${chalk.red.bold('DEV MODE')} Starting up...`)
    }
    console.log(`${logging.prefix} Started express server on port ${chalk.yellowBright(conf.server.port)}`)
});

