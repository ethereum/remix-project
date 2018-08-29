'use strict'

var gray = require('ansi-gray')
var timestamp = require('time-stamp')
var supportsColor = require('color-support')

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

let logger = {
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
  let coloredTimestamp = addColor(timestamp('HH:mm:ss'))
  return '[' + coloredTimestamp + ']'
}

function log () {
  var time = getTimestamp()
  logger.stdout(time + ' ')
  console.log.apply(console, arguments)
  return this
}

function info () {
  var time = getTimestamp()
  logger.stdout(time + ' ')
  console.info.apply(console, arguments)
  return this
}

function dir () {
  var time = getTimestamp()
  logger.stdout(time + ' ')
  console.dir.apply(console, arguments)
  return this
}

function warn () {
  var time = getTimestamp()
  logger.stderr(time + ' ')
  console.warn.apply(console, arguments)
  return this
}

function error () {
  var time = getTimestamp()
  logger.stderr(time + ' ')
  console.error.apply(console, arguments)
  return this
}

module.exports = log
module.exports.info = info
module.exports.dir = dir
module.exports.warn = warn
module.exports.error = error
