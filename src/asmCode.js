'use strict'
var React = require('react')
var style = require('./basicStyles')
var codeResolver = require('./codeResolver')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    tx: React.PropTypes.object,
    web3: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      code: [],
      selected: -1,
      address: '' // selected instruction in the asm
    }
  },

  getDefaultProps: function () {
    return {
      currentStepIndex: -1
    }
  },

  render: function () {
    return (
      <select
        size='10'
        ref='itemsList'
        style={style.instructionsList}
        value={this.state.selected}>
        {this.renderAssemblyItems()}
      </select>
    )
  },

  renderAssemblyItems: function () {
    if (this.state.code) {
      return this.state.code.map(function (item, i) {
        return <option key={i} value={i}>{item}</option>
      })
    }
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.currentStepIndex < 0) return
    codeResolver.setWeb3(this.context.web3)
    var self = this
    if (nextProps.currentStepIndex === 0) {
      self.ensureCodeLoaded(this.context.tx.to, nextProps.currentStepIndex)
    } else {
      this.context.traceManager.getCurrentCalledAddressAt(nextProps.currentStepIndex, function (error, address) {
        if (error) {
          console.log(error)
        } else {
          self.ensureCodeLoaded(address, nextProps.currentStepIndex)
        }
      })
    }
  },

  ensureCodeLoaded: function (address, currentStep) {
    if (address !== this.state.address) {
      this.setState({
        code: ['loading...']
      })
      var self = this
      if (address.indexOf('(Contract Creation Code)') !== -1) {
        this.context.traceManager.getContractCreationCode(address, function (error, hexCode) {
          if (error) {
            console.log(error)
          } else {
            var codes = codeResolver.cacheExecutingCode(address, hexCode)
            self.updateCode(codes.code, address, currentStep)
          }
        })
      } else {
        codeResolver.resolveCode(address, currentStep, this.context.tx, function (address, code) {
          if (window.ethDebuggerSelectedItem !== currentStep) {
            console.log(currentStep + ' discarded. current is ' + window.ethDebuggerSelectedItem)
            return
          }
          self.updateCode(code, address, currentStep)
        })
      }
    } else {
      this.setInstructionIndex(this.state.address, currentStep)
    }
  },

  updateCode: function (code, address, currentStep) {
    this.setState({
      code: code,
      address: address
    })
    this.setInstructionIndex(address, currentStep)
  },

  setInstructionIndex: function (address, step) {
    var self = this
    this.context.traceManager.getCurrentPC(step, function (error, instIndex) {
      if (error) {
        console.log(error)
      } else {
        self.setState({
          selected: codeResolver.getInstructionIndex(address, instIndex)
        })
      }
    })
  }
})
