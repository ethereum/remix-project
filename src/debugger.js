var React = require('react')
var TxBrowser = require('./txBrowser')
var VmTraceManager = require('./vmTraceManager')
var VmTraceBrowser = require('./vmTraceBrowser')
var style = require('./basicStyles')

module.exports = React.createClass({
  getInitialState: function () {
    return {vmTrace: null, state: '', currentStep: -1}
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
    var deb = this
    VmTraceManager.retrieveVmTrace(blockNumber, txNumber, function (error, result) {
      if (error) {
        console.log(error)
      } else {
        deb.setState({vmTrace: result, state: ''})
      }
    })
  }
})
