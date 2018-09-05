var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var traceHelper = remixLib.helpers.trace
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

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
    ${styles.rightPanel.debuggerTab.input_Debugger}
    margin: 3px;
    width: inherit;
  }
  .txbuttons {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .txbutton {
    ${styles.rightPanel.debuggerTab.button_Debugger}
    width: inherit;
  }
  .txbuttonstart {
    ${styles.rightPanel.debuggerTab.button_Debugger}
  }
  .txbutton:hover {
    color: ${styles.rightPanel.debuggerTab.button_Debugger_icon_HoverColor};
  }
  .vmargin {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`

function TxBrowser (_parent, opts) {
  this.event = new EventManager()

  this.blockNumber
  this.txNumber
  this.view
  this.web3 = opts.web3
  var self = this
  _parent.event.register('providerChanged', this, function (provider) {
    self.setDefaultValues()
    // TODO: looks redudant since setDefaultValues already re-renders
    if (self.view) {
      yo.update(self.view, self.render())
    }
  })
}

TxBrowser.prototype.setDefaultValues = function () {
  this.connectInfo = ''
  if (this.view) {
    yo.update(this.view, this.render())
  }
}

TxBrowser.prototype.submit = function (tx) {
  var self = this
  self.event.trigger('newTxLoading', [this.blockNumber, this.txNumber])
  if (tx) {
    return self.update(null, tx)
  }
  if (!this.txNumber) {
    self.update('no tx index or tx hash to look for')
    return
  }
  try {
    if (this.txNumber.indexOf('0x') !== -1) {
      self.web3.eth.getTransaction(this.txNumber, function (error, result) {
        self.update(error, result)
      })
    } else {
      self.web3.eth.getTransactionFromBlock(this.blockNumber, this.txNumber, function (error, result) {
        self.update(error, result)
      })
    }
  } catch (e) {
    self.update(e.message)
  }
}

TxBrowser.prototype.update = function (error, tx) {
  var info = {}
  if (error) {
    this.view.querySelector('#error').innerHTML = error
  } else {
    if (tx) {
      this.view.querySelector('#error').innerHTML = ''
      if (!tx.to) {
        tx.to = traceHelper.contractCreationToken('0')
      }
      info.from = tx.from
      info.to = tx.to
      info.hash = tx.hash
      this.event.trigger('newTraceRequested', [this.blockNumber, this.txNumber, tx])
    } else {
      var mes = '<not found>'
      info.from = mes
      info.to = mes
      info.hash = mes
      this.view.querySelector('#error').innerHTML = 'Cannot find transaction with reference. Block number: ' + this.blockNumber + '. Transaction index/hash: ' + this.txNumber
    }
  }
}

TxBrowser.prototype.updateBlockN = function (ev) {
  this.blockNumber = ev.target.value
}

TxBrowser.prototype.updateTxN = function (ev) {
  this.txNumber = ev.target.value
}

TxBrowser.prototype.load = function (txHash, tx) {
  this.txNumber = txHash
  this.submit(tx)
}

TxBrowser.prototype.unload = function (txHash) {
  this.event.trigger('unloadRequested')
  this.init()
}

TxBrowser.prototype.init = function (ev) {
  this.setDefaultValues()
}

TxBrowser.prototype.render = function () {
  var self = this
  var view = yo`<div class="${css.container}">
        <div class="${css.txContainer}">
          <div class="${css.txinputs}">
            <input class="${css.txinput}" onkeyup=${function () { self.updateBlockN(arguments[0]) }} type='text' placeholder=${'Block number'} />
            <input class="${css.txinput}" id='txinput' onkeyup=${function () { self.updateTxN(arguments[0]) }} type='text' placeholder=${'Transaction index or hash'} />
          </div>
          <div class="${css.txbuttons}">
            <button id='load' class='${css.txbutton}' title='start debugging' onclick=${function () { self.submit() }}>Start debugging</button>
            <button id='unload' class='${css.txbutton}' title='stop debugging' onclick=${function () { self.unload() }}>Stop</button>
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
