'use strict'
var React = require('react')
var TxBrowser = require('./txBrowser')
var AssemblyItemsBrowser = require('./assemblyItemsBrowser')
var style = require('./basicStyles')

module.exports = React.createClass({
  getInitialState: function () {
    return {
      vmTrace: null,
      state: '',
      currentStep: -1
    }
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
        <AssemblyItemsBrowser vmTrace={this.state.vmTrace} transaction={this.state.transaction} />
      </div>
    )
  },

  retrieveVmTrace: function (blockNumber, txNumber, tx) {
    if (this.state.state !== '') return

    var self = this
    this.setState({state: 'loading...'})

    this.props.web3.debug.trace(blockNumber, parseInt(txNumber), function (error, result) {
      if (error) {
        console.log(error)
      } else {
        self.setState({vmTrace: result, transaction: tx, state: ''})
      }
    })
  }
})
