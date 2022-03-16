'use strict'

var CONFIG_FILE = '.remix.config'
const EventEmitter = require('events')

function Config (storage) {
  this.items = {}
  this.unpersistedItems = {}
  this.events = new EventEmitter()

  // load on instantiation
  try {
    var config = storage.get(CONFIG_FILE)
    if (config) {
      this.items = JSON.parse(config)
    }
  } catch (exception) {
     /* Do nothing. */ 
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
      this.events.emit(key + '_changed', content)
    } catch (exception) {
       /* Do nothing. */ 
    }
  }

  this.clear = function () {
    this.items = {}
    storage.remove(CONFIG_FILE)
  }

  this.getUnpersistedProperty = function (key) {
    return this.unpersistedItems[key]
  }

  // TODO: this only used for *one* property "doNotShowTransactionConfirmationAgain"
  // and can be removed once it's refactored away in txRunner
  this.setUnpersistedProperty = function (key, value) {
    this.unpersistedItems[key] = value
  }
}

module.exports = Config
