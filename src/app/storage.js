'use strict'

function Storage () {
  this.exists = function (name) {
    return !!this.get(name)
  }

  this.get = function (name) {
    return window.localStorage.getItem('sol:' + name)
  }

  this.set = function (name, content) {
    window.localStorage.setItem('sol:' + name, content)
  }

  function safeKeys () {
    // NOTE: this is a workaround for some browsers
    return Object.keys(window.localStorage).filter(function (item) { return item !== null && item !== undefined })
  }

  this.keys = function () {
    return safeKeys().filter(function (item) { return item.replace('sol:', '') })
  }

  this.remove = function (name) {
    window.localStorage.removeItem('sol:' + name)
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

  // on startup, upgrade the old storage layout
  safeKeys().forEach(function (name) {
    if (name.indexOf('sol-cache-file-', 0) === 0) {
      var content = window.localStorage.getItem(name)
      window.localStorage.setItem('sol:' + name.replace('sol-cache-file-', ''), content)
      window.localStorage.removeItem(name)
    }
  })
}

module.exports = Storage
