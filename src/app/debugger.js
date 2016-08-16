var remix = require('ethereum-remix');

function Debugger (id, executionContextEvent) {
  this.el = document.querySelector(id);
  this.debugger = new remix.ui.Debugger();
  this.el.appendChild(this.debugger.render());

  var self = this;
  executionContextEvent.register('contextChanged', this, function (context) {
    context = context === 'vm' ? 'VM' : context;
    context = context === 'injected' ? 'EXTERNAL' : context;
    context = context === 'web3' ? 'INTERNAL' : context;
    self.switchProvider(context);
  });
}

Debugger.prototype.debug = function (receipt) {
  var self = this
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
