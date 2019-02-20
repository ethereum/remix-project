var EventManager = require('../../../lib/events')
var yo = require('yo-yo')
var csjs = require('csjs-inject')

var css = csjs`
  .container {
    display: flex;
    flex-direction: column;
  }
  .txContainer {
    display: flex;
    flex-direction: column;
  }
  .txinputs {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .txinput {
    margin: 3px;
    width: inherit;
  }
  .txbuttons {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .txbutton {
    width: inherit;
  }
  .txbuttonstart {
  }
  .txbutton:hover {
  }
  .vmargin {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`

function TxBrowser () {
  this.event = new EventManager()

  this.blockNumber
  this.txNumber
  this.view
  this.setDefaultValues()
}

TxBrowser.prototype.setDefaultValues = function () {
  this.connectInfo = ''
  if (this.view) {
    yo.update(this.view, this.render())
  }
}

TxBrowser.prototype.submit = function (tx) {
  this.event.trigger('requestDebug', [this.blockNumber, this.txNumber, tx])
}

TxBrowser.prototype.update = function (error, tx) {
  if (error) {
    this.view.querySelector('#error').innerHTML = error
    return
  }

  if (!tx) {
    this.view.querySelector('#error').innerHTML = 'Cannot find transaction with reference. Block number: ' + this.blockNumber + '. Transaction index/hash: ' + this.txNumber
    return
  }

  this.view.querySelector('#error').innerHTML = ''
}

TxBrowser.prototype.updateBlockN = function (ev) {
  this.blockNumber = ev.target.value
}

TxBrowser.prototype.updateTxN = function (ev) {
  this.txNumber = ev.target.value
}

TxBrowser.prototype.load = function (txHash, tx) {
  this.txNumber = txHash
}

TxBrowser.prototype.unload = function (txHash) {
  this.event.trigger('unloadRequested')
  this.setDefaultValues()
}

TxBrowser.prototype.render = function () {
  var self = this
  var view = yo`<div class="${css.container}">
        <div class="${css.txContainer}">
          <div class="${css.txinputs} p-1 input-group">
            <input class="form-control" class="${css.txinput}" onkeyup=${function () { self.updateBlockN(arguments[0]) }} type='text' placeholder=${'Block number'} />
            <input class="form-control" class="${css.txinput}" id='txinput' onkeyup=${function () { self.updateTxN(arguments[0]) }} type='text' placeholder=${'Transaction index or hash'} />
          </div>
          <div class="${css.txbuttons} btn-group p-1">
            <button class='btn btn-primary btn-sm' id='load' class='${css.txbutton}' title='start debugging' onclick=${function () { self.submit() }}>Start debugging</button>
            <button class='btn btn-primary btn-sm' id='unload' class='${css.txbutton}' title='stop debugging' onclick=${function () { self.unload() }}>Stop</button>
          </div>
        </div>
        <span id='error'></span>
      </div>`

  if (!this.view) {
    this.view = view
  }

  return view
}

module.exports = TxBrowser
