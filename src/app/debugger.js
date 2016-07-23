var remix = require('ethereum-remix');

function Debugger (executionContext, id) {
  this.el = document.querySelector(id);
  this.debugger = new remix.ui.Debugger();
  this.el.appendChild(this.debugger.render());
}

Debugger.prototype.debug = function (receipt) {
  if (this.onDebugRequested) this.onDebugRequested();
  var self = this;
  this.debugger.web3().eth.getTransaction(receipt.transactionHash, function (error, tx) {
    if (!error) {
      self.debugger.debug(tx);
    }
  });
};

Debugger.prototype.addProvider = function (type, obj) {
  this.debugger.addProvider(type, obj);
};

Debugger.prototype.switchProvider = function (type) {
  this.debugger.switchProvider(type);
};

Debugger.prototype.web3 = function (type) {
  return this.debugger.web3();
};

module.exports = Debugger;
