'use strict'
var EventManager = require('../../../../lib/events')
var DropdownPanel = require('./DropdownPanel')
var solidityTypeFormatter = require('./utils/SolidityTypeFormatter')
var yo = require('yo-yo')

class SolidityLocals {

  constructor (_parent, _traceManager, _internalTreeCall) {
    this.event = new EventManager()
    this.basicPanel = new DropdownPanel('Solidity Locals', {
      json: true,
      formatSelf: solidityTypeFormatter.formatSelf,
      extractData: solidityTypeFormatter.extractData
    })
    this.view
  }

  update (data) {
    this.basicPanel.update(data)
  }

  setMessage (message) {
    this.basicPanel.setMessage(message)
  }

  setUpdating () {
    this.basicPanel.setUpdating()
  }

  render () {
    this.view = yo`<div id='soliditylocals'>${this.basicPanel.render()}</div>`
    return this.view
  }
}

module.exports = SolidityLocals
