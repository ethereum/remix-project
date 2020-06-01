var remixLib = require('remix-lib')
var global = remixLib.global
var EventManager = remixLib.EventManager
var traceHelper = remixLib.helpers.trace
var yo = require('yo-yo')
var init = remixLib.init
var DropdownPanel = require('./DropdownPanel')
var csjs = require('csjs-inject')
var styleGuide = remixLib.ui.themeChooser
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
    min-width: 30px;
    margin: 3px;
  }
  .txbuttons {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .txbutton {
    ${styles.rightPanel.debuggerTab.button_Debugger}
  }
  .txbutton:hover {
    color: ${styles.rightPanel.debuggerTab.button_Debugger_icon_HoverColor};
  }
  .txinfo {
    margin-top: 5px;
  }
  .vmargin {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`
function TxBrowser (_parent) {
  this.event = new EventManager()

  this.blockNumber
  this.txNumber
  this.view
  this.displayConnectionSetting = true
  this.basicPanel = new DropdownPanel('Transaction', {json: true})
  this.basicPanel.data = {}
  var self = this
  _parent.event.register('providerChanged', this, function (provider) {
    self.displayConnectionSetting = provider === 'INTERNAL'
    self.setDefaultValues()
    if (self.view) {
      yo.update(self.view, self.render())
    }
  })
}

// creation 0xa9619e1d0a35b2c1d686f5b661b3abd87f998d2844e8e9cc905edb57fc9ce349
// invocation 0x71a6d583d16d142c5c3e8903060e8a4ee5a5016348a9448df6c3e63b68076ec4 0xcda2b2835add61af54cf83bd076664d98d7908c6cd98d86423b3b48d8b8e51ff
// test:
// creation: 0x72908de76f99fca476f9e3a3b5d352f350a98cd77d09cebfc59ffe32a6ecaa0b
// invocation: 0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51

TxBrowser.prototype.setDefaultValues = function () {
  this.connectInfo = ''
  this.basicPanel.update({})
  this.basicPanel.hide()
  if (this.view) {
    yo.update(this.view, this.render())
  }
}

TxBrowser.prototype.submit = function () {
  if (!this.txNumber) {
    return
  }
  this.event.trigger('newTxLoading', [this.blockNumber, this.txNumber])
  try {
    var self = this
    if (this.txNumber.indexOf('0x') !== -1) {
      global.web3.eth.getTransaction(this.txNumber, function (error, result) {
        self.update(error, result)
      })
    } else {
      global.web3.eth.getTransactionFromBlock(this.blockNumber, this.txNumber, function (error, result) {
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
  this.basicPanel.update(info)
}

TxBrowser.prototype.updateWeb3Url = function (newhost) {
  init.setProvider(global.web3, newhost)
  var self = this
  this.checkWeb3(function (error, block) {
    if (!error) {
      self.connectInfo = 'Connected to ' + global.web3.currentProvider.host + '. Current block number: ' + block
    } else {
      self.connectInfo = 'Unable to connect to ' + global.web3.currentProvider.host + '. ' + error.message
    }
    yo.update(self.view, self.render())
  })
}

TxBrowser.prototype.checkWeb3 = function (callback) {
  try {
    global.web3.eth.getBlockNumber(function (error, block) {
      callback(error, block)
    })
  } catch (e) {
    console.log(e)
    callback(e.message, null)
  }
}

TxBrowser.prototype.updateBlockN = function (ev) {
  this.blockNumber = ev.target.value
}

TxBrowser.prototype.updateTxN = function (ev) {
  this.txNumber = ev.target.value
}

TxBrowser.prototype.load = function (txHash) {
  this.txNumber = txHash
  this.submit()
}

TxBrowser.prototype.unload = function (txHash) {
  this.event.trigger('unloadRequested')
  this.init()
}

TxBrowser.prototype.init = function (ev) {
  this.setDefaultValues()
}

TxBrowser.prototype.connectionSetting = function () {
  if (this.displayConnectionSetting) {
    var self = this
    return yo`<div class="${css.vmargin}"><span>Node URL: </span><input onkeyup=${function () { self.updateWeb3Url(arguments[0].target.value) }} value=${global.web3.currentProvider ? global.web3.currentProvider.host : ' - none - '} type='text' />
              <span>${this.connectInfo}</span></div>`
  } else {
    return ''
  }
}

TxBrowser.prototype.render = function () {
  var self = this
  var view = yo`<div class="${css.container}">
        ${this.connectionSetting()}
        <div class="${css.txContainer}">
          <div class="${css.txinputs}">
            <input class="${css.txinput}" onkeyup=${function () { self.updateBlockN(arguments[0]) }} type='text' placeholder=${'Block number'} />
            <input class="${css.txinput}" id='txinput' onkeyup=${function () { self.updateTxN(arguments[0]) }} type='text' placeholder=${'Transaction index or hash'} />
          </div>
          <div class="${css.txbuttons}">
            <button id='load' class='fa fa-play ${css.txbutton}' title='start debugging' onclick=${function () { self.submit() }}></button>
            <button id='unload' class='fa fa-stop ${css.txbutton}' title='stop debugging' onclick=${function () { self.unload() }}></button>
          </div>
        </div>
        <span id='error'></span>
        <div style=${css.txinfo} id='txinfo'>
          ${this.basicPanel.render()}
        </div>
      </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = TxBrowser
