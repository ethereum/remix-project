var DropdownPanel = require('./DropdownPanel')
var solidityTypeFormatter = require('./utils/SolidityTypeFormatter')
var yo = require('yo-yo')

function SolidityState () {
  this.basicPanel = new DropdownPanel('Solidity State', {
    json: true,
    // TODO: used by TreeView ui
    formatSelf: solidityTypeFormatter.formatSelf,
    extractData: solidityTypeFormatter.extractData
  })
  this.view
}

SolidityState.prototype.update = function (data) {
  this.basicPanel.update(data)
}

SolidityState.prototype.setMessage = function (message) {
  this.basicPanel.setMessage(message)
}

SolidityState.prototype.setUpdating = function () {
  this.basicPanel.setUpdating()
}

SolidityState.prototype.render = function () {
  if (this.view) return
  this.view = yo`<div id='soliditystate' >
      ${this.basicPanel.render()}
    </div>`
  return this.view
}

module.exports = SolidityState
