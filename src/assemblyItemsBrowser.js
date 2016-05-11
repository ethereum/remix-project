'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')
var Sticker = require('./sticker')
var ButtonNavigator = require('./vmTraceButtonNavigator')
var codeUtils = require('./codeUtils')
var style = require('./basicStyles')
var Slider = require('./slider')
var StorageResolver = require('./storageResolver.js')

module.exports = React.createClass({
  contextTypes: {
    web3: React.PropTypes.object
  },
  
  getInitialState: function () {
    return {
      currentSelected: -1, // current selected item in the vmTrace
      selectedInst: -1, // current selected item in the contract assembly code
      currentAddress: null,
      currentStack: null,
      currentLevels: null,
      currentStorage: null,
      currentMemory: null,
      currentCallData: null,
      currentStepInfo: null,
      codes: {}, // assembly items instructions list by contract addesses
      executingCode: [], // code currently loaded in the debugger
      instructionsIndexByBytesOffset: {}, // mapping between bytes offset and instructions index.
      callStack: {},
      storageStates: {}
    }
  },

  getDefaultProps: function () {
    return {
      vmTrace: null,
      transaction: null
    }
  },

  render: function () {
    return (
      <div style={this.props.vmTrace === null ? style.hidden : style.display}>
        <div style={style.container}>
          <span style={style.address}>Current code: {this.state.currentAddress}</span>
        </div>
        <div style={style.container}>
          <Slider
            ref='slider'
            onChange={this.selectState}
            min='0'
            max={this.props.vmTrace ? this.props.vmTrace.length : 0} />
          <ButtonNavigator
            vmTraceLength={this.props.vmTrace ? this.props.vmTrace.length : 0}
            step={this.state.currentSelected}
            stepIntoBack={this.stepIntoBack}
            stepIntoForward={this.stepIntoForward}
            stepOverBack={this.stepOverBack}
            stepOverForward={this.stepOverForward}
            jumpToNextCall={this.jumpToNextCall} />
        </div>
        <StorageResolver ref='storageResolver' transaction={this.props.transaction} />
        <div style={style.container}>
          <table>
            <tbody>
              <tr>
                <td>
                  <select
                    size='10'
                    ref='itemsList'
                    style={style.instructionsList}
                    value={this.state.selectedInst}>
                    {this.renderAssemblyItems()}
                  </select>
                  <div style={Object.assign(style.inline, style.sticker)}>
                    <Sticker data={this.state.currentStepInfo} />
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

  loadCode: function (address, callback) {
    console.log('loading new code from web3 ' + address)
    this.context.web3.eth.getCode(address, function (error, result) {
      if (error) {
        console.log(error)
      } else {
        callback(result)
      }
    })
  },

  cacheExecutingCode: function (address, hexCode) {
    var code = codeUtils.nameOpCodes(new Buffer(hexCode.substring(2), 'hex'))
    this.state.codes[address] = code[0]
    this.state.instructionsIndexByBytesOffset[address] = code[1]
    return {
      code: code[0],
      instructionsIndexByBytesOffset: code[1]
    }
  },

  getExecutingCodeFromCache: function (address) {
    if (this.state.codes[address]) {
      return {
        code: this.state.codes[address],
        instructionsIndexByBytesOffset: this.state.instructionsIndexByBytesOffset[address]
      }
    } else {
      return null
    }
  },

  renderAssemblyItems: function () {
    if (this.props.vmTrace && this.state.executingCode) {
      return this.state.executingCode.map(function (item, i) {
        return <option key={i} value={i}>{item}</option>
      })
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState(this.getInitialState())
    if (!nextProps.vmTrace) {
      return
    }
    this.buildCallStack(nextProps.vmTrace)
    this.updateState(nextProps, 0)
  },

  buildCallStack: function (vmTrace) {
    if (!vmTrace) return
    var callStack = []
    var callStackFrame = {}
    var depth = -1
    this.refs.storageResolver.init(this.props.transaction)
    for (var k = 0; k < vmTrace.length; k++) {
      var trace = vmTrace[k]
      if (trace.depth === undefined || trace.depth === depth) continue
      if (trace.depth > depth) {
        if (k === 0) {
          callStack.push('0x' + vmTrace[k].address) // new context
        } else {
          // getting the address from the stack
          var callTrace = vmTrace[k - 1]
          var address = callTrace.stack[callTrace.stack.length - 2]
          callStack.push(address) // new context
        }
      } else if (trace.depth < depth) {
        callStack.pop() // returning from context
      }
      depth = trace.depth
      callStackFrame[k] = callStack.slice(0)

      this.refs.storageResolver.trackStorageChange(k, trace)
    }
    this.setState({'callStack': callStackFrame})
  },

  updateState: function (props, vmTraceIndex) {
    if (!props.vmTrace || !props.vmTrace[vmTraceIndex]) return
    var previousIndex = this.state.currentSelected
    var stateChanges = {}

    var stack
    if (props.vmTrace[vmTraceIndex].stack) { // there's always a stack
      stack = props.vmTrace[vmTraceIndex].stack.slice(0)
      stack.reverse()
      Object.assign(stateChanges, { 'currentStack': stack })
    }

    var newContextLoaded = false
    var depthIndex = this.shouldUpdateStateProperty('depth', vmTraceIndex, previousIndex, props.vmTrace)
    if (depthIndex > -1) {
      Object.assign(stateChanges, {'currentCallStack': this.state.callStack[depthIndex]})
      // updating exectution context:
      var address = this.resolveAddress(depthIndex, props)
      if (address !== this.state.currentAddress) {
        var self = this
        this.ensureExecutingCodeUpdated(address, vmTraceIndex, props, function (code) {
          if (self.state.currentAddress !== address) {
            console.log('updating executing code ' + self.state.currentAddress + ' -> ' + address)
            self.setState(
              {
                'selectedInst': code.instructionsIndexByBytesOffset[props.vmTrace[vmTraceIndex].pc],
                'executingCode': code.code,
                'currentAddress': address
              })
          }
        })
        newContextLoaded = true
      }
    }
    if (!newContextLoaded) {
      Object.assign(stateChanges,
        {
          'selectedInst': this.getExecutingCodeFromCache(this.state.currentAddress).instructionsIndexByBytesOffset[props.vmTrace[vmTraceIndex].pc]
        })
    }

    Object.assign(stateChanges, { 'currentSelected': vmTraceIndex })

    this.refs.storageResolver.rebuildStorageAt(vmTraceIndex, props.transaction, function (storage) {
      Object.assign(stateChanges, { 'currentStorage': storage })
    })

    var memoryIndex = this.shouldUpdateStateProperty('memory', vmTraceIndex, previousIndex, props.vmTrace)
    if (memoryIndex > -1) {
      Object.assign(stateChanges, { 'currentMemory': this.formatMemory(props.vmTrace[memoryIndex].memory, 16) })
    }

    var callDataIndex = this.shouldUpdateStateProperty('calldata', vmTraceIndex, previousIndex, props.vmTrace)
    if (callDataIndex > -1) {
      Object.assign(stateChanges, { 'currentCallData': [props.vmTrace[callDataIndex].calldata] })
    }

    stateChanges['currentStepInfo'] = [
      'Current Step: ' + props.vmTrace[vmTraceIndex].steps,
      'Adding Memory: ' + (props.vmTrace[vmTraceIndex].memexpand ? props.vmTrace[vmTraceIndex].memexpand : ''),
      'Step Cost: ' + props.vmTrace[vmTraceIndex].gascost,
      'Remaining Gas: ' + props.vmTrace[vmTraceIndex].gas
    ]

    this.refs.slider.setValue(vmTraceIndex)
    this.setState(stateChanges)
  },

  ensureExecutingCodeUpdated: function (address, vmTraceIndex, props, callBack) {
    this.resolveCode(address, vmTraceIndex, props, function (address, code) {
      callBack(code)
    })
  },

  resolveAddress: function (vmTraceIndex, props) {
    var address = props.vmTrace[vmTraceIndex].address
    if (vmTraceIndex > 0) {
      var stack = this.state.callStack[vmTraceIndex] // callcode, delegatecall, ...
      address = stack[stack.length - 1]
    }
    return address
  },

  resolveCode: function (address, vmTraceIndex, props, callBack) {
    var cache = this.getExecutingCodeFromCache(address)
    if (cache) {
      callBack(address, cache)
      return
    }

    if (vmTraceIndex === 0 && props.transaction.to === null) { // start of the trace
      callBack(address, this.cacheExecutingCode(address, props.transaction.input))
      return
    }

    var self = this
    this.loadCode(address, function (code) {
      callBack(address, self.cacheExecutingCode(address, code))
    })
  },

  shouldUpdateStateProperty: function (vmTraceName, nextIndex, previousIndex, vmTrace) {
    var propIndex = -1
    if (previousIndex + 1 === nextIndex) {
      propIndex = nextIndex
    } else {
      propIndex = this.retrieveLastSeenProperty(nextIndex, vmTraceName, vmTrace)
    }

    if (propIndex > -1 && vmTrace[propIndex][vmTraceName] !== undefined) {
      return propIndex
    } else {
      return -1
    }
  },

  retrieveLastSeenProperty: function (currentIndex, propertyName, vmTrace) {
    var index = currentIndex
    while (index > 0) {
      if (vmTrace[index][propertyName]) {
        break
      }
      index--
    }
    return index
  },

  jumpToNextCall: function () {
    var i = this.state.currentSelected
    while (++i < this.props.vmTrace.length) {
      if (this.isCallInstruction(i)) {
        this.selectState(i + 1)
        break
      }
    }
  },

  stepIntoBack: function () {
    this.moveSelection(-1)
  },

  stepIntoForward: function () {
    this.moveSelection(1)
  },

  stepOverBack: function () {
    if (this.isReturnInstruction(this.state.currentSelected - 1)) {
      this.stepOutBack()
    } else {
      this.moveSelection(-1)
    }
  },

  stepOverForward: function () {
    if (this.isCallInstruction(this.state.currentSelected)) {
      this.stepOutForward()
    } else {
      this.moveSelection(1)
    }
  },

  isCallInstruction: function (index) {
    var state = this.props.vmTrace[index]
    return state.instname === 'CALL' || state.instname === 'CALLCODE' || state.instname === 'CREATE' || state.instname === 'DELEGATECALL'
  },

  isReturnInstruction: function (index) {
    var state = this.props.vmTrace[index]
    return state.instname === 'RETURN'
  },

  stepOutBack: function () {
    var i = this.state.currentSelected - 1
    var depth = 0
    while (--i >= 0) {
      if (this.isCallInstruction(i)) {
        if (depth === 0) {
          break
        } else {
          depth--
        }
      } else if (this.isReturnInstruction(i)) {
        depth++
      }
    }
    this.selectState(i)
  },

  stepOutForward: function () {
    var i = this.state.currentSelected
    var depth = 0
    while (++i < this.props.vmTrace.length) {
      if (this.isReturnInstruction(i)) {
        if (depth === 0) {
          break
        } else {
          depth--
        }
      } else if (this.isCallInstruction(i)) {
        depth++
      }
    }
    this.selectState(i + 1)
  },

  moveSelection: function (incr) {
    this.selectState(this.state.currentSelected + incr)
  },

  selectState: function (index) {
    this.updateState(this.props, index)
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
