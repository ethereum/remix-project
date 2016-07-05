/* global web3Override */
module.exports = function (browser, callback) {
  extendBrowser(browser)

  browser
    .url('http://127.0.0.1:8080')
  injectScript('./test/resources/testWeb3.js', browser, function () {
    callback()
  })
}

function readFile (filename, callback) {
  var fs = require('fs')
  try {
    console.log('reading ' + filename)
    fs.readFile(filename, 'utf8', callback)
  } catch (e) {
    console.log(e)
    callback(e)
  }
}

function injectScript (file, browser, callback) {
  readFile(file, function (error, result) {
    if (!error) {
      browser.execute(function (data) {
        eval.call(null, data) // eslint-disable-line
        var vmdebugger = document.getElementById('app').vmdebugger
        vmdebugger.web3.eth.getCode = web3Override.getCode
        vmdebugger.web3.debug.traceTransaction = web3Override.traceTransaction
        vmdebugger.web3.debug.storageAt = web3Override.storageAt
        vmdebugger.web3.eth.getTransaction = web3Override.getTransaction
        vmdebugger.web3.eth.getTransactionFromBlock = web3Override.getTransactionFromBlock
        vmdebugger.web3.eth.getBlockNumber = web3Override.getBlockNumber
      }, [result], function () {
        callback()
      })
    }
  })
}

function extendBrowser (browser) {
  browser.assertCurrentSelectedItem = function (expected) {
    browser.getValue('#asmitems', function (result) {
      browser.expect.element('#asmitems option[value="' + result.value + '"]').text.to.equal(expected)
    })
    return browser
  }

  browser.assertSticker = function (vmtracestepinfo, stepinfo, addmemoryinfo, gasinfo, remaininggasinfo, loadedaddressinfo) {
    browser.expect.element('#vmtracestepinfo').text.to.equal(vmtracestepinfo)
    browser.expect.element('#stepinfo').text.to.equal(stepinfo)
    browser.expect.element('#addmemoryinfo').text.to.equal(addmemoryinfo)
    browser.expect.element('#gasinfo').text.to.equal(gasinfo)
    browser.expect.element('#remaininggasinfo').text.to.equal(remaininggasinfo)
    browser.expect.element('#loadedaddressinfo').text.to.equal(loadedaddressinfo)
    return browser
  }

  browser.assertStack = function (value) {
    return assertPanel('#stackpanel', browser, value)
  }

  browser.assertStorageChanges = function (value) {
    return assertPanel('#storagepanel', browser, value)
  }

  browser.assertMemory = function (value) {
    return assertPanel('#memorypanel', browser, value)
  }

  browser.assertCallData = function (value) {
    return assertPanel('#calldatapanel', browser, value)
  }

  browser.assertCallStack = function (value) {
    return assertPanel('#callstackpanel', browser, value)
  }

  browser.assertStackValue = function (index, value) {
    return assertPanelValue('#stackpanel', browser, index, value)
  }

  browser.assertStorageChangesValue = function (index, value) {
    return assertPanelValue('#storagepanel', browser, index, value)
  }

  browser.assertMemoryValue = function (index, value) {
    return assertPanelValue('#memorypanel', browser, index, value)
  }

  browser.assertCallStackValue = function (index, value) {
    return assertPanelValue('#callstackpanel', browser, index, value)
  }
}

function assertPanel (id, browser, value) {
  browser.expect.element(id + ' #basicpanel').text.to.equal(value)
  return browser
}

function assertPanelValue (id, browser, index, value, done) {
  browser.getText(id + ' #basicpanel', function (result) {
    var values = result.value.split('\n')
    browser.assert.equal(values[index], value)
  })
  return browser
}
