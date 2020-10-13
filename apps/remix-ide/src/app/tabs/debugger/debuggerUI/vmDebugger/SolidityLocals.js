'use strict'
var EventManager = require('../../../../../lib/events')
var DropdownPanel = require('./DropdownPanel')
var solidityTypeFormatter = require('./utils/SolidityTypeFormatter')
var yo = require('yo-yo')

class SolidityLocals {

  constructor () {
    this.event = new EventManager()
    this.basicPanel = new DropdownPanel('Solidity Locals', {
      json: true,
      formatSelf: solidityTypeFormatter.formatSelf,
      extractData: solidityTypeFormatter.extractData,
      loadMore: (cursor) => {
        this.event.trigger('solidityLocalsLoadMore', [cursor])
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
    this._data = this.mergeLocals(data, this._data)
    this.basicPanel.update(this._data)
  }

  setMessage (message) {
    this.basicPanel.setMessage(message)
  }

  setUpdating () {
    this.basicPanel.setUpdating()
  }

  mergeLocals (locals1, locals2) {
    Object.keys(locals2).map(item => {
      if (locals2[item].cursor && (parseInt(locals2[item].cursor) < parseInt(locals1[item].cursor))) {
        locals2[item] = {
          ...locals1[item],
          value: [...locals2[item].value, ...locals1[item].value]
        }
      }
    })
    return locals2
  }

  render () {
    this.view = yo`<div id='soliditylocals' data-id="solidityLocals">${this.basicPanel.render()}</div>`
    return this.view
  }
}

module.exports = SolidityLocals
