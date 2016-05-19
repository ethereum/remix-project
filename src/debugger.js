'use strict'
var React = require('react')
var TxBrowser = require('./txBrowser')
var StepManager = require('./stepManager')
var AssemblyItemsBrowser = require('./vmDebugger')
var traceManager = require('./traceManager')
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
    tx: React.PropTypes.object
  },

  getChildContext: function () {
    return {
      web3: this.props.web3,
      traceManager: traceManager,
      tx: this.state.tx
    }
  },

  componentDidMount: function () {
    traceManager.setWeb3(this.props.web3)
  },

  render: function () {
    return (
      <div style={style.wrapper}>
        <h1 style={style.container}>Eth Debugger</h1>
        <TxBrowser onNewTxRequested={this.startDebugging} />
        <StepManager ref='stepManager' onStepChanged={this.stepChanged} />
        <AssemblyItemsBrowser ref='assemblyitemsbrowser' currentStepIndex={this.state.currentStepIndex} />
      </div>
    )
  },

  stepChanged: function (stepIndex) {
    this.setState({
      currentStepIndex: stepIndex
    })
  },

  startDebugging: function (blockNumber, txIndex, tx) {
    if (traceManager.isLoading) {
      return
    }
    console.log('loading trace...')
    this.setState({
      tx: tx
    })
    traceManager.setTransaction(tx)
    var self = this
    traceManager.resolveTrace(blockNumber, txIndex, function (success) {
      console.log('trace loaded ' + success)
      self.setState({
        currentStepIndex: 0
      })
      self.refs.stepManager.newTraceAvailable()
    })
  }
})
