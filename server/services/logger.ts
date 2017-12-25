import * as winston from 'winston';
import {LoggerSettings} from './loggerSettings';

let log = new (winston.Logger)({transports: [
    new winston.transports.Console((new LoggerSettings('console')).loggingFormat),
    new winston.transports.File((new LoggerSettings('file')).loggingFormat)
  ]});

export const logger = log;
