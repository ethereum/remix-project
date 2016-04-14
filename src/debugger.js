var React = require('react');
var TxBrowser = require('./txBrowser');
var VmTraceManager = require('./vmTraceManager');
var VmTraceBrowser = require('./vmTraceBrowser');

module.exports = React.createClass({
  getInitialState: function() {
	 return {vmTrace: null}
  },

  render: function() {
    return (
        <div>
          <h1>Debugger</h1>
		      <TxBrowser onNewTxRequested={this.retrieveVmTrace} />
		      <VmTraceBrowser vmTrace={this.state.vmTrace} />
        </div>
    );
  },

  retrieveVmTrace: function(blockNumber, txNumber)
  { 
	  this.setState({vmTrace: VmTraceManager.retrieveVmTrace(blockNumber, txNumber)});
  }
});
