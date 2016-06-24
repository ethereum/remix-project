/* global chrome, confirm */

var utils = require('./utils');

function Storage (updateFiles) {
  var EDITOR_SIZE_CACHE_KEY = 'editor-size-cache';

  this.rename = function (originalName, newName) {
    var content = this.get(originalName);
    this.set(newName, content);
    this.remove(originalName);
  };

  this.remove = function (name) {
    window.localStorage.removeItem(name);
  };

  this.setEditorSize = function (size) {
    this.set(EDITOR_SIZE_CACHE_KEY, size);
  };

  this.getEditorSize = function () {
    return this.get(EDITOR_SIZE_CACHE_KEY);
  };

  this.getFileContent = function (key) {
    return this.get(utils.fileKey(key));
  };

  this.exists = function (key) {
    return !!this.get(key);
  };

  this.set = function (key, content) {
    window.localStorage.setItem(key, content);
  };

  this.get = function (key) {
    return window.localStorage.getItem(key);
  };

  this.keys = function () {
    return Object.keys(window.localStorage);
  };

  this.loadFile = function (filename, content) {
    if (this.exists(filename) && this.get(filename) !== content) {
      var count = '';
      while (this.exists(filename + count)) count = count - 1;
      this.rename(filename, filename + count);
    }
    this.set(filename, content);
  };

  this.sync = function () {
    if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.sync) {
      return;
    }

    var obj = {};
    var done = false;
    var count = 0;

    function check (key) {
      chrome.storage.sync.get(key, function (resp) {
        console.log('comparing to cloud', key, resp);
        if (typeof resp[key] !== 'undefined' && obj[key] !== resp[key] && confirm('Overwrite "' + utils.fileNameFromKey(key) + '"? Click Ok to overwrite local file with file from cloud. Cancel will push your local file to the cloud.')) {
          console.log('Overwriting', key);
          window.localStorage.setItem(key, resp[key]);
          updateFiles();
        } else {
          console.log('add to obj', obj, key);
          obj[key] = window.localStorage[key];
        }
        done++;
        if (done >= count) {
          chrome.storage.sync.set(obj, function () {
            console.log('updated cloud files with: ', obj, this, arguments);
          });
        }
      });
    }

    for (var y in window.localStorage) {
      console.log('checking', y);
      obj[y] = window.localStorage.getItem(y);
      if (!utils.isCachedFile(y)) {
        continue;
      }
      count++;
      check(y);
    }
  };
}

module.exports = Storage;
