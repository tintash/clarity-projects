const { createLogger, format, transports } = require("winston");
const { combine, printf, timestamp, colorize } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} - ${level}: ${stack || message}`;
});

const logger = createLogger({
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:MM:SS" }),
    format.errors({ stack: true }),
    logFormat
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
