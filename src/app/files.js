'use strict'

function Files (storage) {
  var readonly = {}

  this.exists = function (path) {
    // NOTE: ignore the config file
    if (path === '.browser-solidity.json') {
      return
    }

    if (this.isReadOnly(path)) {
      return true
    } else {
      return storage.exists(path)
    }
  }

  this.get = function (path) {
    // NOTE: ignore the config file
    if (path === '.browser-solidity.json') {
      return
    }

    if (this.isReadOnly(path)) {
      return readonly[path]
    } else {
      return storage.get(path)
    }
  }

  this.set = function (path, content) {
    // NOTE: ignore the config file
    if (path === '.browser-solidity.json') {
      return
    }

    if (!this.isReadOnly(path)) {
      storage.set(path, content)
    }
  }

  this.addReadOnly = function (path, content) {
    if (!storage.exists(path)) {
      readonly[path] = content
    }
  }

  this.isReadOnly = function (path) {
    return !!readonly[path]
  }

  this.remove = function (path) {
    if (!this.exists(path)) {
      return
    }

    if (this.isReadOnly(path)) {
      readonly[path] = undefined
    } else {
      storage.remove(path)
    }
  }

  this.rename = function (oldPath, newPath) {
    if (!this.isReadOnly(oldPath) && storage.exists(oldPath)) {
      storage.rename(oldPath, newPath)
    }
  }

  this.list = function () {
    var files = {}

    // add r/w files to the list
    storage.keys().forEach(function (path) {
      // NOTE: as a temporary measure do not show the config file
      if (path !== '.browser-solidity.json') {
        files[path] = false
      }
    })

    // add r/o files to the list
    Object.keys(readonly).forEach(function (path) {
      files[path] = true
    })

    return files
  }
}

module.exports = Files
