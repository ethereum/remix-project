'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    web3: React.PropTypes.object,
    codeManager: React.PropTypes.object,
    root: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      currentStepIndex: -1
    }
  },

  getInitialState: function () {
    return {
      data: null
    }
  },

  render: function () {
    return (
      <BasicPanel name='Memory' data={this.state.data} />
    )
  },

  componentDidMount: function () {
    var self = this
    this.context.root.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (window.ethDebuggerSelectedItem !== index) return

      self.context.traceManager.getMemoryAt(index, function (error, memory) {
        if (error) {
          console.log(error)
        } else if (window.ethDebuggerSelectedItem === index) {
          self.setState({
            data: self.formatMemory(memory, 16)
          })
        }
      })
    })
  },

  formatMemory: function (mem, width) {
    var ret = ''
    if (!mem) {
      return ret
    }

    if (!mem.substr) {
      mem = mem.join('') // geth returns an array, eth return raw string
    }

    for (var k = 0; k < mem.length; k += (width * 2)) {
      var memory = mem.substr(k, width * 2)
      var content = this.tryAsciiFormat(memory)
      ret += this.context.web3.toHex(k) + '   ' + content.raw + ' ' + content.ascii + '\n'
    }
    return ret
  },

  tryAsciiFormat: function (memorySlot) {
    var ret = { ascii: '', raw: '' }
    for (var k = 0; k < memorySlot.length; k += 2) {
      var raw = memorySlot.substr(k, 2)
      var ascii = String.fromCharCode(parseInt(raw, 16))
      ascii = ascii.replace(/\W/g, '?')
      if (ascii === '') {
        ascii = '?'
      }
      ret.ascii += ascii
      ret.raw += ' ' + raw
    }
    return ret
  }
})
