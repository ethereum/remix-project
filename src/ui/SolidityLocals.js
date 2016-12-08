'use strict'
var DropdownPanel = require('./DropdownPanel')
var localDecoder = require('../solidity/localDecoder')
var yo = require('yo-yo')

class SolidityLocals {

  constructor (_parent, _traceManager, internalTreeCall) {
    this.parent = _parent
    this.internalTreeCall = internalTreeCall
    this.traceManager = _traceManager
    this.basicPanel = new DropdownPanel('Solidity Locals')
    this.init()
  }

  render () {
    return yo`<div id='soliditylocals' >${this.basicPanel.render()}</div>`
  }

  init () {
    this.parent.event.register('indexChanged', this, (index) => {
      if (index < 0) {
        this.basicPanel.update({info: 'invalid step index'})
        return
      }
      if (this.parent.currentStepIndex !== index) return

      this.traceManager.waterfall([
        this.traceManager.getStackAt,
        this.traceManager.getMemoryAt],
        index,
        function (error, result) {
          if (!error) {
            var stack = result[0].value
            var memory = result[1].value
            var locals = localDecoder.soliditylocals(index, this.internalTreeCall, stack, memory)
            this.basicPanel.update(locals)
          }
        })
    })
  }
}

module.exports = SolidityLocals
