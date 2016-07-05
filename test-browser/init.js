var init = require('../test/init')
module.exports = function (browser, callback) {
  extendBrowser(browser)

  browser
    .url('http://127.0.0.1:8080')
    .waitForElementPresent('#app div', 1000)
  injectScript('./test/resources/testWeb3.json', browser, function () {
    callback()
  })
}

function injectScript (file, browser, callback) {
  init.readFile(file, function (error, result) {
    if (!error) {
      browser.execute(function (data) {
        // var vmdebugger = window.vmdebugger // document.getElementById('app').vmdebugger
        data = JSON.parse(data)
        window.vmdebugger.web3.eth.getCode = function (address, callback) {
          if (callback) {
            callback(null, data.testCodes[address])
          } else {
            return data.testCodes[address]
          }
        }

        window.vmdebugger.web3.debug.traceTransaction = function (txHash, options, callback) {
          callback(null, data.testTraces[txHash])
        }

        window.vmdebugger.web3.debug.storageAt = function (blockNumber, txIndex, address, callback) {
          callback(null, {})
        }

        window.vmdebugger.web3.eth.getTransaction = function (txHash, callback) {
          if (callback) {
            callback(null, data.testTxs[txHash])
          } else {
            return data.testTxs[txHash]
          }
        }

        window.vmdebugger.web3.eth.getTransactionFromBlock = function (blockNumber, txIndex, callback) {
          if (callback) {
            callback(null, data.testTxsByBlock[blockNumber + '-' + txIndex])
          } else {
            return data.testTxsByBlock[blockNumber + '-' + txIndex]
          }
        }

        window.vmdebugger.web3.eth.getBlockNumber = function (callback) { callback('web3 modified testing purposes :)') }

        window.vmdebugger.web3.eth.getBlockNumber(function (r) {
          console.log('rrrr' + r)
        })
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
