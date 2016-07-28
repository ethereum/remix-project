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
        var vmdebugger = document.getElementById('app').vmdebugger
        data = JSON.parse(data)
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

        uiTestweb3.debug.storageAt = function (blockNumber, txIndex, address, callback) {
          callback(null, {})
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

        uiTestweb3.eth.providers = { 'HttpProvider': function (url) {} }

        uiTestweb3.eth.setProvider = function (provider) {}

        uiTestweb3.currentProvider = {host: 'web3 modified for testing purposes :)'}

        vmdebugger.addProvider('TEST', uiTestweb3)
        vmdebugger.switchProvider('TEST')
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

  browser.debugerKeyCode = {
    'Enter': 13,
    'Up': 38,
    'Down': 40,
    'Right': '39',
    'Left': 37,
    'Esc': 27,
    'SpaceBar': 32,
    'Ctrl': 17,
    'Alt': 18,
    'Shift': 16
  }

/* browser.sendKeys is not working for safari */
/* still not working properly
browser.fireEvent = function (el, key, times, callback) {
  var data = {
    'id': el.substring(1),
    'key': key,
    'times': times
  }
  browser.execute(function (data) {
    data = JSON.parse(data)
    var el = document.getElementById(data.id)
    var eventObj
    console.log(el)
    console.log(data)
    var k = 0
    if (document.createEventObject) {
      eventObj = document.createEventObject()
      eventObj.keyCode = data.key
      while (k < data.times) {
        console.log('firing brfore createEventObject')
        el.fireEvent('onkeypress', eventObj)
        console.log('firing')
        k++
      }
    } else if (typeof (KeyboardEvent) === 'function') {
      eventObj = new KeyboardEvent('keyup')
      eventObj.key = data.key
      eventObj.which = data.key
      while (k < data.times) {
        console.log('firing brfore createEvent')
        el.dispatchEvent(eventObj)
        console.log('firing')
        k++
      }
    }
  }, [JSON.stringify(data)], function () {
    callback()
  })
}
*/
}

function assertPanel (id, browser, value) {
  browser.expect.element(id + ' #basicpanel').text.to.equal(value)
  return browser
}

function assertPanelValue (id, browser, index, value) {
  getInnerText(id + ' #basicpanel', browser, function (result) {
    var values
    if (result.value.indexOf('\r\n') !== -1) {
      values = result.value.split('\r\n')
    } else if (result.value.indexOf('\n') !== -1) {
      values = result.value.split('\n')
    } else if (result.value.indexOf('\r') !== -1) {
      values = result.value.split('\r')
    }
    browser.assert.equal(values[index], value)
  })
  return browser
}

function getInnerText (id, browser, callback) {
  browser.execute(function (data) {
    return document.querySelector(data).innerText
  }, [id], function (result) {
    callback(result)
  })
}
