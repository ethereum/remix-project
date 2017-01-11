'use strict'

var utils = require('./utils')

function Storage () {
  this.rename = function (originalName, newName) {
    var content = this.get(originalName)
    this.set(newName, content)
    this.remove(originalName)
  }

  this.remove = function (name) {
    window.localStorage.removeItem(name)
  }

  this.getFileContent = function (key) {
    return this.get(utils.fileKey(key))
  }

  this.exists = function (key) {
    return !!this.get(key)
  }

  this.set = function (key, content) {
    window.localStorage.setItem(key, content)
  }

  this.get = function (key) {
    return window.localStorage.getItem(key)
  }

  this.keys = function () {
    // NOTE: this is a workaround for some browsers
    return Object.keys(window.localStorage).filter(function (item) { return item !== null && item !== undefined })
  }

  this.loadFile = function (filename, content) {
    if (this.exists(filename) && this.get(filename) !== content) {
      var count = ''
      while (this.exists(filename + count)) count = count - 1
      this.rename(filename, filename + count)
    }
    this.set(filename, content)
  }
}

module.exports = Storage
