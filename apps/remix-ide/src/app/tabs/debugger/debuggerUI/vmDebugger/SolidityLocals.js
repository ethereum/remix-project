'use strict'
var EventManager = require('../../../../../lib/events')
var DropdownPanel = require('./DropdownPanel')
var solidityTypeFormatter = require('./utils/SolidityTypeFormatter')
var yo = require('yo-yo')

class SolidityLocals {

  constructor (vmDebuggerLogic) {
    this.event = new EventManager()
    this.basicPanel = new DropdownPanel('Solidity Locals', {
      json: true,
      formatSelf: solidityTypeFormatter.formatSelf,
      extractData: solidityTypeFormatter.extractData,
      loadMore: (cursor) => {
        console.log('cursor: ', cursor)
        vmDebuggerLogic.event.trigger('solidityLocalsLoadMore', [cursor])
      }
    })
    this.view
    this._data = null
  }

  update (data) {
    this._data = data
    this.basicPanel.update(this._data)
  }

  loadMore (data) {
    const mergedLocals = this.mergeLocals(data, this._data)

    this.basicPanel.update(mergedLocals)
  }

  setMessage (message) {
    this.basicPanel.setMessage(message)
  }

  setUpdating () {
    this.basicPanel.setUpdating()
  }

  mergeLocals (locals1, locals2) {
    console.log('locals1: ', locals1)
    console.log('locals2: ', locals2)
    return {}
  }

  render () {
    this.view = yo`<div id='soliditylocals' data-id="solidityLocals">${this.basicPanel.render()}</div>`
    return this.view
  }
}

module.exports = SolidityLocals
