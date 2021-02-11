import colors from 'colors'
import winston, { Logger, LoggerOptions } from 'winston'
import timestamp from 'time-stamp'
import supportsColor from 'color-support'

function hasFlag (flag: string) {
  return ((typeof (process) !== 'undefined') && (process.argv.indexOf('--' + flag) !== -1))
}

function addColor (str: string) {
  if (hasFlag('no-color')) {
    return str
  }

  if (hasFlag('color')) {
    return colors.gray(str)
  }

  if (supportsColor()) {
    return colors.gray(str)
  }

  return str
}
function getTimestamp () {
  return '[' + addColor(timestamp('HH:mm:ss')) + ']'
}
// create winston logger format
const logFmt = winston.format.printf((info) => {
  return `${getTimestamp()} ${info.level}: ${info.message}`
})

class Log {
    logger: Logger;
    constructor () {
      this.logger = winston.createLogger({
        level: 'info',
        transports: [new winston.transports.Console()],
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          logFmt
        )
      })
    }

    setVerbosity (v: LoggerOptions['level']): void {
      this.logger.configure({
        level: v,
        transports: [new winston.transports.Console()],
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          logFmt
        )
      })
    }
}

export = Log
