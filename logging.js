const chalk = require("chalk");


module.exports = {
    prefix: chalk.cyan('[') + chalk.greenBright('chem') + chalk.redBright('crawl') + chalk.cyan(']'),
    comp: {
        db: `> ${chalk.magenta('DB')} >`
    },
    levels : {
        warn: chalk.yellowBright('WARNING'),
        err: chalk.redBright('ERROR')
    }
};