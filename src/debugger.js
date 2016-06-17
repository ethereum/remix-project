'use strict'
var React = require('react')
var TxBrowser = require('./txBrowser')
var StepManager = require('./stepManager')
var VmDebugger = require('./vmDebugger')
var style = require('./basicStyles')

module.exports = React.createClass({
  getInitialState: function () {
    return {
      currentStepIndex: -1, // index of the selected item in the vmtrace
      tx: null
    }
  },

  childContextTypes: {
    web3: React.PropTypes.object,
    traceManager: React.PropTypes.object,
    codeManager: React.PropTypes.object,
    tx: React.PropTypes.object
  },

  getChildContext: function () {
    return {
      web3: this.props.context.web3,
      traceManager: this.props.context.traceManager,
      codeManager: this.props.context.codeManager,
      tx: this.state.tx
    }
  },

  render: function () {
    return (
      <div style={style.font}>
        <h1 style={style.container}>Eth Debugger</h1>
        <TxBrowser onNewTxRequested={this.startDebugging} />
        <StepManager ref='stepManager' onStepChanged={this.stepChanged} />
        <VmDebugger ref='assemblyitemsbrowser' currentStepIndex={this.state.currentStepIndex} />
      </div>
    )
  },

  stepChanged: function (stepIndex) {
    this.setState({
      currentStepIndex: stepIndex
    })
    this.props.context.codeManager.resolveStep(stepIndex, this.state.tx)
  },

  startDebugging: function (blockNumber, txIndex, tx) {
    if (this.props.context.traceManager.isLoading) {
      return
    }
    console.log('loading trace...')
    this.setState({
      tx: tx
    })
    var self = this
    this.props.context.traceManager.resolveTrace(tx, function (success) {
      console.log('trace loaded ' + success)
      self.setState({
        currentStepIndex: 0
      })
      self.refs.stepManager.newTraceAvailable()
      self.props.context.codeManager.resolveStep(0, tx)
    })
  }
})
