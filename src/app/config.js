'use strict'

var CONFIG_FILE = '.remix.config'

function Config (storage) {
  this.items = {}

  // load on instantiation
  try {
    var config = storage.get(CONFIG_FILE)
    if (config) {
      this.items = JSON.parse(config)
    }
  } catch (exception) {
  }

  this.exists = function (key) {
    return this.items[key] !== undefined
  }

  this.get = function (key) {
    return this.items[key]
  }

  this.set = function (key, content) {
    this.items[key] = content
    try {
      storage.set(CONFIG_FILE, JSON.stringify(this.items))
    } catch (exception) {
    }
  }
}

module.exports = Config
