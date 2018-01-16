'use strict'

var CONFIG_FILE = '.remix.config'

function Config (storage) {
  this.items = {}
  this.unpersistedItems = {}

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
    this.ensureStorageUpdated(key)
    return this.items[key]
  }

  this.set = function (key, content) {
    this.items[key] = content
    try {
      storage.set(CONFIG_FILE, JSON.stringify(this.items))
    } catch (exception) {
    }
  }

  this.ensureStorageUpdated = function (key) {
    if (key === 'currentFile') {
      if (this.items[key] && this.items[key] !== '' &&
        this.items[key].indexOf('browser/') !== 0 &&
        this.items[key].indexOf('localhost/') !== 0 &&
        this.items[key].indexOf('swarm/') !== 0 &&
        this.items[key].indexOf('gist/') !== 0 &&
        this.items[key].indexOf('github/') !== 0 &&
        this.items[key].indexOf('ipfs/') !== 0) {
        this.items[key] = 'browser/' + this.items[key]
      }
    }
  }

  this.getUnpersistedProperty = function (key) {
    return this.unpersistedItems[key]
  }

  this.setUnpersistedProperty = function (key, value) {
    this.unpersistedItems[key] = value
  }
}

module.exports = Config
