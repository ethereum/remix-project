var utils = require('./utils');

function StorageHandler (updateFiles) {

  this.sync = function () {

    if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.sync) {
      return;
    }

    var obj = {};
    var done = false;
    var count = 0
    var dont = 0;

    function check (key) {
      chrome.storage.sync.get(key, function (resp) {
        console.log('comparing to cloud', key, resp);
        if (typeof resp[key] !== 'undefined' && obj[key] !== resp[key] && confirm('Overwrite "' + fileNameFromKey(key) + '"? Click Ok to overwrite local file with file from cloud. Cancel will push your local file to the cloud.')) {
          console.log('Overwriting', key);
          localStorage.setItem(key, resp[key]);
          updateFiles();
        } else {
          console.log('add to obj', obj, key);
          obj[key] = localStorage[key];
        }
        done++;
        if (done >= count) {
          chrome.storage.sync.set(obj, function () {
            console.log('updated cloud files with: ', obj, this, arguments);
          })
        }
      })
    }

    for (var y in window.localStorage) {
      console.log('checking', y);
      obj[y] = window.localStorage.getItem(y);
      if (y.indexOf(utils.getCacheFilePrefix()) !== 0) {
        continue;
      }
      count++;
      check(y);
    }
  };
}

module.exports = StorageHandler;
