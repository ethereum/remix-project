'use strict'

const gray = require('ansi-gray')
const timestamp = require('time-stamp')
const supportsColor = require('color-support')

function hasFlag (flag) {
  return ((typeof (process) !== 'undefined') && (process.argv.indexOf('--' + flag) !== -1))
}

function addColor (str) {
  if (hasFlag('no-color')) {
    return str
  }

  if (hasFlag('color')) {
    return gray(str)
  }

  if (supportsColor()) {
    return gray(str)
  }

  return str
}

const logger = {
  stdout: function (arg) {
    if (typeof (process) === 'undefined' || !process.stdout) return
    process.stdout.write(arg)
  },
  stderr: function (arg) {
    if (typeof (process) === 'undefined' || process.stderr) return
    process.stderr.write(arg)
  }
}

function getTimestamp () {
  const coloredTimestamp = addColor(timestamp('HH:mm:ss'))
  return '[' + coloredTimestamp + ']'
}

function log () {
  const time = getTimestamp()
  logger.stdout(time + ' ')
  console.log.apply(console, arguments)
  return this
}

function info () {
  const time = getTimestamp()
  logger.stdout(time + ' ')
  console.info.apply(console, arguments)
  return this
}

function dir () {
  const time = getTimestamp()
  logger.stdout(time + ' ')
  console.dir.apply(console, arguments)
  return this
}

function warn () {
  const time = getTimestamp()
  logger.stderr(time + ' ')
  console.warn.apply(console, arguments)
  return this
}

function error () {
  const time = getTimestamp()
  logger.stderr(time + ' ')
  console.error.apply(console, arguments)
  return this
}

module.exports = log
module.exports.info = info
module.exports.dir = dir
module.exports.warn = warn
module.exports.error = error
