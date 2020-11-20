'use strict'

import gray from 'ansi-gray'
import timestamp from 'time-stamp'
import supportsColor from 'color-support'

export class Logger {

  private hasFlag(flag) {
    return ((typeof (process) !== 'undefined') && (process.argv.indexOf('--' + flag) !== -1))
  }

  private addColor(str) {
    if (this.hasFlag('no-color')) {
      return str
    }

    if (this.hasFlag('color')) {
      return gray(str)
    }

    if (supportsColor()) {
      return gray(str)
    }

    return str
  }

  private stdout(arg) {
    if (typeof (process) === 'undefined' || !process.stdout) return
    process.stdout.write(arg)
  }

  private stderr(arg) {
    if (typeof (process) === 'undefined' || process.stderr) return
    process.stderr.write(arg)
  }

  private getTimestamp() {
    const coloredTimestamp = this.addColor(timestamp('HH:mm:ss'))
    return '[' + coloredTimestamp + ']'
  }

  log(...args: any[]) {
    const time = this.getTimestamp()
    this.stdout(time + ' ')
    console.log(args)
    return this
  }

  info(...args: any[]) {
    const time = this.getTimestamp()
    this.stdout(time + ' ')
    console.info(args)
    return this
  }

  dir(...args: any[]) {
    const time = this.getTimestamp()
    this.stdout(time + ' ')
    console.dir(args)
    return this
  }

  warn(...args: any[]) {
    const time = this.getTimestamp()
    this.stderr(time + ' ')
    console.warn(args)
    return this
  }

  error(...args: any[]) {
    const time = this.getTimestamp()
    this.stderr(time + ' ')
    console.error(args)
    return this
  }
}
