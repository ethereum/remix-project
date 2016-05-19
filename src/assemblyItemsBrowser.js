'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')
var Sticker = require('./sticker')
var style = require('./basicStyles')
var ASMCode = require('./asmCode')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    web3: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      currentAddress: null,
      currentStack: null,
      currentStorage: null,
      currentMemory: null,
      currentCallData: null
    }
  },

  getDefaultProps: function () {
    return {
      currentStepIndex: -1 // index of the selected item in the vmtrace
    }
  },

  render: function () {
    return (
      <div style={this.props.vmTrace === null ? style.hidden : style.display}>
        <div style={style.container}>
          <span style={style.address}>Current code: {this.state.currentAddress}</span>
        </div>
        <div style={style.container}>
          <table>
            <tbody>
              <tr>
                <td>
                  <ASMCode currentStepIndex={this.props.currentStepIndex} />
                  <div style={Object.assign(style.inline, style.sticker)}>
                    <Sticker currentStepIndex={this.props.currentStepIndex} />
                  </div>
                </td>
                <td>
                  <BasicPanel name='CallData' data={this.state.currentCallData} />
                </td>
              </tr>
              <tr>
                <td>
                  <BasicPanel name='Stack' data={this.state.currentStack} />
                </td>
                <td>
                  <BasicPanel name='CallStack' data={this.state.currentCallStack} />
                </td>
              </tr>
              <tr>
                <td>
                  <BasicPanel name='Storage' data={this.state.currentStorage} renderRow={this.renderStorageRow} />
                </td>
                <td>
                  <BasicPanel name='Memory' data={this.state.currentMemory} renderRow={this.renderMemoryRow} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },

  renderStorageRow: function (data) {
    var ret = []
    if (data) {
      for (var key in data) {
        ret.push(
          <tr key={key}>
            <td>
              {key}
            </td>
            <td>
              {data[key]}
            </td>
          </tr>)
      }
    }
    return ret
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

  componentWillReceiveProps: function (nextProps) {
    console.log("asse " + JSON.stringify(nextProps))
    if (nextProps.currentStepIndex < 0) return

    var self = this
    this.context.traceManager.getCallDataAt(nextProps.currentStepIndex, function (calldata) {
      self.setState({
        currentCallData: calldata
      })
    })

    this.context.traceManager.getCallStackAt(nextProps.currentStepIndex, function (callstack) {
      self.setState({
        currentCallStack: callstack
      })
    })

    this.context.traceManager.getMemoryAt(nextProps.currentStepIndex, function (memory) {
      self.setState({
        currentMemory: self.formatMemory(memory, 16)
      })
    })

    this.context.traceManager.getStorageAt(nextProps.currentStepIndex, function (storage) {
      self.setState({
        currentStorage: storage
      })
    })

    this.context.traceManager.getStackAt(nextProps.currentStepIndex, function (stack) {
      self.setState({
        currentStack: stack
      })
    })

    this.context.traceManager.getCurrentCalledAddressAt(nextProps.currentStepIndex, function (address) {
      self.setState({
        currentAddress: address
      })
    })
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
