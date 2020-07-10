/* global XMLHttpRequest */
function loadJSON (url, callback) {
  var xobj = new XMLHttpRequest()
  xobj.overrideMimeType('application/json')
  xobj.open('GET', url, true)
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === 200) {
      callback(xobj.responseText)
    }
  }
  xobj.send(null)
}

function loadTestWeb3 (data) {
  var container = document.getElementById('app')
  var vmdebugger = container.debugger
  var uiTestweb3 = {}
  uiTestweb3.eth = {}
  uiTestweb3.debug = {}
  uiTestweb3.eth.getCode = function (address, callback) {
    if (callback) {
      callback(null, data.testCodes[address])
    } else {
      return data.testCodes[address]
    }
  }

  uiTestweb3.debug.traceTransaction = function (txHash, options, callback) {
    callback(null, data.testTraces[txHash])
  }

  uiTestweb3.debug.storageRangeAt = function (blockNumber, txIndex, address, start, size, callback) {
    callback(null, { storage: {}, complete: true })
  }

  uiTestweb3.eth.getTransaction = function (txHash, callback) {
    if (callback) {
      callback(null, data.testTxs[txHash])
    } else {
      return data.testTxs[txHash]
    }
  }

  uiTestweb3.eth.getTransactionFromBlock = function (blockNumber, txIndex, callback) {
    if (callback) {
      callback(null, data.testTxsByBlock[blockNumber + '-' + txIndex])
    } else {
      return data.testTxsByBlock[blockNumber + '-' + txIndex]
    }
  }

  uiTestweb3.eth.getBlockNumber = function (callback) { callback(null, 'web3 modified for testing purposes :)') }

  uiTestweb3.providers = { 'HttpProvider': function (url) {} }

  uiTestweb3.setProvider = function (provider) {}

  uiTestweb3.currentProvider = {host: 'web3 modified for testing purposes :)'}
  vmdebugger.addProvider('TEST', uiTestweb3)
  vmdebugger.switchProvider('TEST')
}

function waitForRemix (data) {
  setTimeout(function () {
    if (!document.getElementById('app').debugger) {
      waitForRemix(data)
    } else {
      loadTestWeb3(data)
    }
  }, 500)
}

loadJSON('/test-browser/resources/testWeb3.json', function (result) {
  var data = JSON.parse(result)
  waitForRemix(data)
})

