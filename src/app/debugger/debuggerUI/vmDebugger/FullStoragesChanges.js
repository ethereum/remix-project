var DropdownPanel = require('./DropdownPanel')
var yo = require('yo-yo')

function FullStoragesChanges () {
  this.view
  this.basicPanel = new DropdownPanel('Full Storages Changes', {json: true})
}

FullStoragesChanges.prototype.update = function (storageData) {
  this.basicPanel.update(storageData)
}

FullStoragesChanges.prototype.render = function () {
  var view = yo`<div id='fullstorageschangespanel' >${this.basicPanel.render()}</div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = FullStoragesChanges
