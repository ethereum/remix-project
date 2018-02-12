/* global chrome */
'use strict'
var modalDialogCustom = require('../ui/modal-dialog-custom')

module.exports = function (filesProviders) {
  if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.sync) {
    return
  }

  var obj = {}
  var done = false
  var count = 0

  function check (key) {
    chrome.storage.sync.get(key, function (resp) {
      console.log('comparing to cloud', key, resp)

      function confirmDialog (callback) {
        modalDialogCustom.confirm('', 'Overwrite "' + key + '"? Click Ok to overwrite local file with file from cloud. Cancel will push your local file to the cloud.', () => { callback(true) }, () => { callback(false) })
      }

      if (typeof resp[key] !== 'undefined' && obj[key] !== resp[key]) {
        confirmDialog((result) => {
          if (result) {
            console.log('Overwriting', key)
            filesProviders['browser'].set(key, resp[key])
          }
        })
      } else {
        console.log('add to obj', obj, key)
        filesProviders['browser'].get(key, (error, content) => {
          if (error) {
            console.log(error)
          } else {
            obj[key] = content
          }
        })
      }

      done++
      if (done >= count) {
        chrome.storage.sync.set(obj, function () {
          console.log('updated cloud files with: ', obj, this, arguments)
        })
      }
    })
  }

  filesProviders['browser'].resolve('browser', (error, files) => {
    if (!error) {
      Object.keys(files).forEach((path) => {
        filesProviders['browser'].get(path, (error, content) => {
          if (error) {
            console.log(error)
          } else {
            obj[path] = content
            count++
            check(path)
          }
        })
      })
    }
  })
}
