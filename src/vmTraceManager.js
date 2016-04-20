module.exports = {
	retrieveVmTrace: function(blockNumber, txNumber) {		
		return web3.admin.vmTrace(blockNumber, parseInt(txNumber), "T0Li2pYtq70=");
	}
}
