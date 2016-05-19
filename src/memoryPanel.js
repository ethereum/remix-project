'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    web3: React.PropTypes.object
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
      <BasicPanel name='Memory' data={this.state.data} renderRow={this.renderMemoryRow} />
    )
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.currentStepIndex < 0) return
    if (window.ethDebuggerSelectedItem !== nextProps.currentStepIndex) return

    var self = this
    this.context.traceManager.getMemoryAt(nextProps.currentStepIndex, function (memory) {
      if (window.ethDebuggerSelectedItem === nextProps.currentStepIndex) {
        self.setState({
          data: self.formatMemory(memory, 16)
        })
      }
    })
  },

  renderMemoryRow: function (data) {
    var ret = []
    if (data) {
      for (var key in data) {
        var memSlot = data[key]
        ret.push(
          <tr key={key}>
            <td>
              {memSlot.address}
            </td>
            <td>
              {memSlot.content.raw}
            </td>
            <td>
              {memSlot.content.ascii}
            </td>
          </tr>)
      }
    }
    return ret
  },

  formatMemory: function (mem, width) {
    var ret = []
    for (var k = 0; k < mem.length; k += (width * 2)) {
      var memory = mem.substr(k, width * 2)
      ret.push({
        address: this.context.web3.toHex(k),
        content: this.tryAsciiFormat(memory)
      })
    }
    return ret
  },

  tryAsciiFormat: function (memorySlot) {
    var ret = { ascii: '', raw: '' }
    for (var k = 0; k < memorySlot.length; k += 2) {
      var raw = memorySlot.substr(k, 2)
      var ascii = this.context.web3.toAscii(raw)
      if (ascii === String.fromCharCode(0)) {
        ret.ascii += '?'
      } else {
        ret.ascii += ascii
      }
      ret.raw += ' ' + raw
    }
    return ret
  }
})
