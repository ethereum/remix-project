var React = require('react');

module.exports = React.createClass({
	getInitialState: function() {
		return {blockNumber: "1160004", txNumber: "1"}
	},

	submit: function()
	{
		var vmTrace = web3.admin.vmTrace(this.state.blockNumber, parseInt(this.state.txNumber), "TmrjdiILLn0=");
		console.log(JSON.stringify(vmTrace));	
	},
	
	updateBlockN: function(ev) {
	  this.state.blockNumber = ev.target.value;
	},
	
	updateTxN: function(ev) {
	  this.state.txNumber = ev.target.value;
	},

	render: function() {
		
		return (
		<div>
			<div><h3>Transaction details</h3></div>
			<input onChange={this.updateBlockN} type="text" placeholder={this.state.blockNumber}></input>
			<input onChange={this.updateTxN} type="text" placeholder={this.state.txNumber}></input>
			<button onClick={this.submit}>Get</button>
		</div>
		);
	}
})