const winston = require('winston');
const fs = require('fs');
/*
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
    return `${level}:{ Moment:${timestamp} , Message:${message} }`;
});
*/
if(!fs.existsSync('logs'))
{
    fs.mkdirSync('logs');
}

module.exports = new winston.createLogger({
    level:"info",
    transports:[
        new winston.transports.File({
            filename: "logs/payfast.log",
            maxsize: 100000,
            maxFiles: 10
        })
    ]
});
