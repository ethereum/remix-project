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
    console.log('asm' + JSON.stringify(nextProps))
    if (nextProps.currentStepIndex < 0) return
    codeResolver.setWeb3(this.context.web3)
    var self = this
    this.context.traceManager.getCurrentCalledAddressAt(nextProps.currentStepIndex, function (address) {
      self.ensureCodeLoaded(address, nextProps.currentStepIndex)
    })
  },

  ensureCodeLoaded: function (address, currentStep) {
    if (address !== this.state.address) {
      this.setState({
        code: ['loading...']
      })
      var self = this
      codeResolver.resolveCode(address, currentStep, this.context.tx, function (address, code) {
        self.setState({
          code: code,
          address: address
        })
        self.setInstructionIndex(address, currentStep)
      })
    } else {
      this.setInstructionIndex(this.state.address, currentStep)
    }
  },

  setInstructionIndex: function (address, step) {
    var self = this
    this.context.traceManager.getCurrentPC(step, function (instIndex) {
      self.setState({
        selected: codeResolver.getInstructionIndex(address, instIndex)
      })
    })
  }
})
