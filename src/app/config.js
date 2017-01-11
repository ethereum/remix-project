'use strict'

var utils = require('./utils')

var CONFIG_FILE = utils.fileKey('.browser-solidity.json')

function Config (storage) {
  this.items = {}

  // load on instantiation
  var config = storage.get(CONFIG_FILE)
  if (config) {
    this.items = JSON.parse(config)
  }

  this.exists = function (key) {
    return this.items[key] !== undefined
  }

  this.get = function (key) {
    return this.items[key]
  }

  this.set = function (key, content) {
    this.items[key] = content
    storage.set(CONFIG_FILE, JSON.stringify(this.items))
  }
}

module.exports = Config
