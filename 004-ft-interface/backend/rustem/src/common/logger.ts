import { createLogger, format, transports } from "winston";
const { combine, printf, timestamp, colorize } = format;

const logFormat = printf(({ level, message, timeStamp, stack }) => {
  return `${timeStamp} - ${level}: ${stack || message}`;
});

export const logger = createLogger({
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:MM:SS" }),
    format.errors({ stack: true }),
    logFormat
  ),
  transports: [new transports.Console()],
});
