var Remix = require('ethereum-remix');
var $ = require('jquery');

function Debugger (executionContext, _id) {
  this.el = document.querySelector(_id);
  this.debugger = new Remix(executionContext.web3());
  this.el.appendChild(this.debugger.render());
  this.web3 = executionContext.web3();
  this.debugView = $('ul#options li.debugView');

  Debugger.prototype.debug = function (receipt) {
    document.querySelector('ul#options').selectTab(this.debugView);
    var self = this;
    this.web3.eth.getTransaction(receipt.transactionHash, function (error, tx) {
      if (!error) {
        self.debugger.debug(tx);
      }
    });
  };
}

module.exports = Debugger;
