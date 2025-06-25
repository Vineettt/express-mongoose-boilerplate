const winston = require("winston");
const { format } = require("winston");

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  silly: 'magenta'
});

const myFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.colorize(),
  format.printf((info: { timestamp: any; level: any; message: any; }) => `${info.timestamp} [${info.level}]: ${info.message}`)
);

const logger = winston.createLogger({
  format: myFormat,
  transports: [new winston.transports.Console()],
});

module.exports = logger
