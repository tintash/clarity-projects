"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const { combine, printf, timestamp, colorize } = winston_1.format;
const logFormat = printf(({ level, message, timeStamp, stack }) => {
    return `${timeStamp} - ${level}: ${stack || message}`;
});
exports.logger = (0, winston_1.createLogger)({
    format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:MM:SS" }), winston_1.format.errors({ stack: true }), logFormat),
    transports: [new winston_1.transports.Console()],
});
