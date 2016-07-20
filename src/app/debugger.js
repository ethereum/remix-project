var remix = require('ethereum-remix');

function Debugger (_executionContext, _id) {
  this.el = document.querySelector(_id);
  this.debugger = new remix.Debugger(_executionContext.web3());
  this.el.appendChild(this.debugger.render());
  this.web3 = _executionContext.web3();

  Debugger.prototype.debug = function (receipt) {
    if (this.onDebugRequested) this.onDebugRequested();
    var self = this;
    this.web3.eth.getTransaction(receipt.transactionHash, function (error, tx) {
      if (!error) {
        self.debugger.debug(tx);
      }
    });
  };
}

module.exports = Debugger;
