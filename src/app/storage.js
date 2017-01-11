'use strict'

function Storage () {
  this.exists = function (name) {
    return !!this.get(name)
  }

  this.get = function (name) {
    return window.localStorage.getItem(name)
  }

  this.set = function (name, content) {
    window.localStorage.setItem(name, content)
  }

  this.keys = function () {
    // NOTE: this is a workaround for some browsers
    return Object.keys(window.localStorage).filter(function (item) { return item !== null && item !== undefined })
  }

  this.remove = function (name) {
    window.localStorage.removeItem(name)
  }

  this.rename = function (originalName, newName) {
    var content = this.get(originalName)
    this.set(newName, content)
    this.remove(originalName)
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
