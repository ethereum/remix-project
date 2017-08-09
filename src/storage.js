'use strict'

function Storage (prefix) {
  this.exists = function (name) {
    return this.get(name) !== null
  }

  this.get = function (name) {
    return window.localStorage.getItem(prefix + name)
  }

  this.set = function (name, content) {
    try {
      window.localStorage.setItem(prefix + name, content)
    } catch (exception) {
      return false
    }
    return true
  }

  this.remove = function (name) {
    window.localStorage.removeItem(prefix + name)
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

  function safeKeys () {
    // NOTE: this is a workaround for some browsers
    return Object.keys(window.localStorage).filter(function (item) { return item !== null && item !== undefined })
  }

  this.keys = function () {
    return safeKeys()
      // filter any names not including the prefix
      .filter(function (item) { return item.indexOf(prefix, 0) === 0 })
      // remove prefix from filename and add the 'browser' path
      .map(function (item) { return item.substr(prefix.length) })
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
