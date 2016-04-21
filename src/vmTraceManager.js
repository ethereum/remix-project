module.exports = {
	retrieveVmTrace: function(blockNumber, txNumber) {		
		return web3.debug.debugTrace(blockNumber, parseInt(txNumber));
	}
}
