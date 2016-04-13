module.exports = {
	retrieveVmTrace: function(blockNumber, txNumber) {
		return web3.admin.vmTrace(blockNumber, parseInt(txNumber), "TmrjdiILLn0=");
	}
}
