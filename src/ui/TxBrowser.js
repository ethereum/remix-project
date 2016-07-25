var style = require('./styles/basicStyles')
var util = require('../helpers/global')
var EventManager = require('../lib/eventManager')
var traceHelper = require('../helpers/traceHelper')
var yo = require('yo-yo')
var ui = require('../helpers/ui')
var init = require('../helpers/init')

function TxBrowser (_web3, _displayConnectionSetting) {
  util.extend(this, new EventManager())
  this.web3 = _web3

  this.blockNumber
  this.txNumber
  this.hash
  this.from
  this.to
  this.view
  this.displayConnectionSetting = true
  if (_displayConnectionSetting !== undefined) {
    this.displayConnectionSetting = _displayConnectionSetting
  }
  if (this.displayConnectionSetting) {
    this.setDefaultValues()
  }
}

// creation 0xa9619e1d0a35b2c1d686f5b661b3abd87f998d2844e8e9cc905edb57fc9ce349
// invokation 0x71a6d583d16d142c5c3e8903060e8a4ee5a5016348a9448df6c3e63b68076ec4 0xcda2b2835add61af54cf83bd076664d98d7908c6cd98d86423b3b48d8b8e51ff
// test:
// creation: 0x72908de76f99fca476f9e3a3b5d352f350a98cd77d09cebfc59ffe32a6ecaa0b
// invokation: 0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51

TxBrowser.prototype.setDefaultValues = function () {
  this.from = ' - '
  this.to = ' - '
  this.hash = ' - '
  this.blockNumber = null
  this.txNumber = '0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51'
  this.connectInfo = ''
  this.updateWeb3Url(this.web3.currentProvider.host)
}

TxBrowser.prototype.submit = function () {
  if (!this.txNumber) {
    return
  }
  this.trigger('newTxLoading', [this.blockNumber, this.txNumber, tx])
  var tx
  try {
    if (this.txNumber.indexOf('0x') !== -1) {
      tx = this.web3.eth.getTransaction(this.txNumber)
    } else {
      tx = this.web3.eth.getTransactionFromBlock(this.blockNumber, this.txNumber)
    }
  } catch (e) {
    console.log(e)
  }
  console.log(JSON.stringify(tx))
  if (tx) {
    if (!tx.to) {
      tx.to = traceHelper.contractCreationToken('0')
    }
    this.from = tx.from
    this.to = tx.to
    this.hash = tx.hash
    this.trigger('newTraceRequested', [this.blockNumber, this.txNumber, tx])
  } else {
    var mes = '<not found>'
    this.from = mes
    this.to = mes
    this.hash = mes
    console.log('cannot find ' + this.blockNumber + ' ' + this.txNumber)
  }
  yo.update(this.view, this.render())
}

TxBrowser.prototype.updateWeb3Url = function (newhost) {
  init.setProvider(this.web3, newhost)
  var self = this
  this.checkWeb3(function (error, block) {
    if (!error) {
      self.connectInfo = 'Connected to ' + self.web3.currentProvider.host + '. Current block number: ' + block
    } else {
      self.connectInfo = 'Unable to connect to ' + self.web3.currentProvider.host + '. ' + error.message
    }
    yo.update(self.view, self.render())
  })
}

TxBrowser.prototype.checkWeb3 = function (callback) {
  try {
    this.web3.eth.getBlockNumber(function (error, block) {
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
  yo.update(this.view, this.render())
  this.submit()
}

TxBrowser.prototype.init = function (ev) {
  this.setDefaultValues()
  yo.update(this.view, this.render())
}

TxBrowser.prototype.connectionSetting = function () {
  if (this.displayConnectionSetting) {
    var self = this
    return yo`<div style=${ui.formatCss(style.vmargin)}><span>Node URL: </span><input onkeyup=${function () { self.updateWeb3Url(arguments[0].target.value) }} value=${this.web3.currentProvider ? this.web3.currentProvider.host : ' - none - '} type='text' />
              <span>${this.connectInfo}</span></div>`
  } else {
    return ''
  }
}

TxBrowser.prototype.render = function () {
  var self = this
  var view = yo`<div style=${ui.formatCss(style.container)}>
        ${this.connectionSetting()}
        <input onkeyup=${function () { self.updateBlockN(arguments[0]) }} type='text' placeholder=${'Block number (default 1000110)' + this.blockNumber} />
        <input id='txinput' onkeyup=${function () { self.updateTxN(arguments[0]) }} type='text' value=${this.txNumber} placeholder=${'Transaction Number or hash (default 2) ' + this.txNumber} />
        <button id='load' onclick=${function () { self.submit() }}>
          Load
        </button>
        <button id='unload' onclick=${function () { self.trigger('unloadRequested') }}>Unload</button>
        <div style=${ui.formatCss(style.transactionInfo)}>
          <table>
            <tbody>
              <tr>
                <td>
                  Hash:
                </td>
                <td id='txhash' >
                  ${this.hash}
                </td>
              </tr>
              <tr>
                <td>
                  From:
                </td>
                <td id='txfrom'>
                  ${this.from}
                </td>
              </tr>
              <tr>
                <td>
                  To:
                </td>
                <td id='txto' >
                  ${this.to}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = TxBrowser
