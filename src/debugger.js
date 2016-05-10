'use strict'
var React = require('react')
var TxBrowser = require('./txBrowser')
var VmTraceBrowser = require('./vmTraceBrowser')
var style = require('./basicStyles')

module.exports = React.createClass({
  getInitialState: function () {
    return {vmTrace: null, state: '', currentStep: -1}
  },

  childContextTypes: {
    web3: React.PropTypes.object
  },

  getChildContext: function () {
    return { web3: this.props.web3 }
  },

  render: function () {
    return (
      <div style={style.wrapper}>
        <h1 style={style.container}>Eth Debugger</h1>
        <TxBrowser onNewTxRequested={this.retrieveVmTrace} />
        <div style={style.container}>
          {this.state.state}
        </div>
        <VmTraceBrowser vmTrace={this.state.vmTrace} />
      </div>
    )
  },

  retrieveVmTrace: function (blockNumber, txNumber) {
    this.setState({state: 'loading...'})
    var self = this
    this.props.web3.debug.trace(blockNumber, parseInt(txNumber), function (error, result) {
      if (error) {
        console.log(error)
      } else {
        self.setState({vmTrace: result, state: ''})
      }
    })
  }
})
