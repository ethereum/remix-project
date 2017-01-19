'use strict'

function Storage () {
  this.exists = function (name) {
    return !!this.get(name)
  }

  this.get = function (name) {
    return window.localStorage.getItem('sol:' + name)
  }

  this.set = function (name, content) {
    try {
      window.localStorage.setItem('sol:' + name, content)
    } catch (exception) {
      return false
    }
    return true
  }

  function safeKeys () {
    // NOTE: this is a workaround for some browsers
    return Object.keys(window.localStorage).filter(function (item) { return item !== null && item !== undefined })
  }

  this.keys = function () {
    return safeKeys()
      // filter any names not including sol:
      .filter(function (item) { return item.indexOf('sol:', 0) === 0 })
      // remove sol: from filename
      .map(function (item) { return item.replace(/^sol:/, '') })
  }

  this.remove = function (name) {
    window.localStorage.removeItem('sol:' + name)
    return true
  }

  this.rename = function (originalName, newName) {
    var content = this.get(originalName)
    if (!this.set(newName, content)) {
      return false
    }
    this.remove(originalName)
    return true
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
      window.localStorage.setItem(name.replace(/^sol-cache-file-/, 'sol:'), content)
      window.localStorage.removeItem(name)
    }
  })

  // remove obsolete key
  window.localStorage.removeItem('editor-size-cache')
}

module.exports = Storage
