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
    font-size: small;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

  this.state = {
    txNumber: undefined,
    debugging: false
  }
  this.view
}

TxBrowser.prototype.submit = function () {
  if (this.state.debugging) {
    this.unload()
  } else {
    this.event.trigger('requestDebug', [undefined, this.state.txNumber])
  }
  yo.update(this.view, this.render())
}

TxBrowser.prototype.updateTxN = function (ev) {
  this.state.txNumber = ev.target.value
}

TxBrowser.prototype.load = function (txHash, tx) {
  this.state.txNumber = txHash
}

TxBrowser.prototype.unload = function () {
  this.event.trigger('unloadRequested')
}

TxBrowser.prototype.setState = function (state) {
  this.state = {...this.state, ...state}
  if (this.view) {
    yo.update(this.view, this.render())
  }
}

TxBrowser.prototype.render = function () {
  var self = this
  var view = yo`<div class="${css.container}">
        <div class="${css.txContainer}">
          <div class="${css.txinputs} p-1 input-group">
            <input
              value="${this.state.txNumber || ''}"
              class="form-control m-0 ${css.txinput}"
              id='txinput'
              onkeyup=${function () { self.updateTxN(arguments[0]) }}
              type='text'
              placeholder=${'Transaction hash'}
            />
          </div>
          <div class="${css.txbuttons} btn-group p-1">
            <button class='btn btn-primary btn-sm ${css.txbutton} disabled='${this.state.txNumber ? 'false' : 'true'}' id='load' title='${this.state.debugging ? 'Stop' : 'Start'} debugging' onclick=${function () { self.submit() }}>${this.state.debugging ? 'Stop' : 'Start'} debugging</button>
          </div>
        </div>
        <span id='error'></span>
      </div>`
  if (this.state.debugging) {
    view.querySelectorAll('input').forEach(element => { element.setAttribute('disabled', '') })
  }
  if (!this.view) {
    this.view = view
  }

  return view
}

module.exports = TxBrowser
