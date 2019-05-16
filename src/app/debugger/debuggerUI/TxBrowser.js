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
  this.debugging = false
}

TxBrowser.prototype.submit = function () {
  if (this.debugging) {
    this.unload()
  } else {
    this.event.trigger('requestDebug', [this.blockNumber, this.txNumber])
  }
  yo.update(this.view, this.render())
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

TxBrowser.prototype.unload = function () {
  this.event.trigger('unloadRequested')
}

TxBrowser.prototype.setState = function (state) {
  if (state.debugging !== undefined) this.debugging = state.debugging
  if (state.blockNumber !== undefined) this.blockNumber = state.blockNumber
  if (state.txNumber !== undefined) this.txNumber = state.txNumber
  if (this.view) {
    yo.update(this.view, this.render())
  }
}

TxBrowser.prototype.render = function () {
  var self = this
  var view = yo`<div class="${css.container}">
        <div class="${css.txContainer}">
          <div class="${css.txinputs} p-1 input-group">
            <input value="${this.blockNumber || ''}" class="form-control ${css.txinput}" onkeyup=${function () { self.updateBlockN(arguments[0]) }} type='text' placeholder=${'Block number'} />
            <input value="${this.txNumber || ''}" class="form-control ${css.txinput}" id='txinput' onkeyup=${function () { self.updateTxN(arguments[0]) }} type='text' placeholder=${'Transaction index or hash'} />
          </div>
          <div class="${css.txbuttons} btn-group p-1">
            <button class='btn btn-primary btn-sm ${css.txbutton}' id='load' title='${this.debugging ? 'Stop' : 'Start'} debugging' onclick=${function () { self.submit() }}>${this.debugging ? 'Stop' : 'Start'} debugging</button>
          </div>
        </div>
        <span id='error'></span>
      </div>`
  if (this.debugging) {
    view.querySelectorAll('input').forEach(element => { element.setAttribute('disabled', '') })
  }
  if (!this.view) {
    this.view = view
  }

  return view
}

module.exports = TxBrowser
