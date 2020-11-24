'use strict'

import gray from 'ansi-gray'
import timestamp from 'time-stamp'
import supportsColor from 'color-support'

function hasFlag(flag) {
  return ((typeof (process) !== 'undefined') && (process.argv.indexOf('--' + flag) !== -1))
}

function addColor(str) {
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

function stdout(arg) {
  if (typeof (process) === 'undefined' || !process.stdout) return
  process.stdout.write(arg)
}

function stderr(arg) {
  if (typeof (process) === 'undefined' || process.stderr) return
  process.stderr.write(arg)
}

function getTimestamp() {
  const coloredTimestamp = this.addColor(timestamp('HH:mm:ss'))
  return '[' + coloredTimestamp + ']'
}

export function log(...args: any[]) {
  const time = this.getTimestamp()
  this.stdout(time + ' ')
  console.log(args)
  return this
}

export function info(...args: any[]) {
  const time = this.getTimestamp()
  this.stdout(time + ' ')
  console.info(args)
  return this
}

export function dir(...args: any[]) {
  const time = this.getTimestamp()
  this.stdout(time + ' ')
  console.dir(args)
  return this
}

export function warn(...args: any[]) {
  const time = this.getTimestamp()
  this.stderr(time + ' ')
  console.warn(args)
  return this
}

export function error(...args: any[]) {
  const time = this.getTimestamp()
  this.stderr(time + ' ')
  console.error(args)
  return this
}
