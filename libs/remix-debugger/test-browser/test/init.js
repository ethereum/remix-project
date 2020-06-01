module.exports = function (browser, callback) {
  extendBrowser(browser)
  browser
    .url('http://127.0.0.1:8080')
    .injectScript('test-browser/resources/insertTestWeb3.js', function () {
      // wait for the script to load test web3...
      setTimeout(function () {
        callback()
      }, 5000)
    })
}

function extendBrowser (browser) {
  browser.multipleClick = function (id, time) {
    for (var k = 0; k < time; k++) {
      browser.click(id)
    }
    return browser
  }

  browser.assertCurrentSelectedItem = function (expected) {
    browser.execute(function (id) {
      var node = document.querySelector('#asmcodes div div[selected="selected"] span')
      return node.innerText
    }, [''], function (returnValue) {
      browser.assert.equal(returnValue.value, expected)
    })
    return browser
  }

  browser.retrieveInnerText = function (selector, callback) {
    browser.execute(function (selector) {
      var node = document.querySelector(selector)
      return node ? node.innerText : ''
    }, [selector], function (returnValue) {
      callback(returnValue.value)
    })
    return browser
  }

  browser.assertStepDetail = function (vmtracestepinfo, stepinfo, addmemoryinfo, gasinfo, remaininggasinfo, loadedaddressinfo) {
    assertPanel('#stepdetail', browser, ['vmtracestep:' + vmtracestepinfo, 'executionstep:' + stepinfo, 'addmemory:' + addmemoryinfo, 'gas:' + gasinfo, 'remaininggas:' + remaininggasinfo, 'loadedaddress:' + loadedaddressinfo])
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
  var selector = '.dropdownpanel div.dropdowncontent ul'
  browser.execute(function (id, selector) {
    var el = document.getElementById(id.replace('#', '').replace('.', ''))
    var node = el.querySelector(selector)
    var ret = []
    for (var k = 0; k < node.children.length; k++) {
      if (node.children[k].innerText) {
        ret.push(node.children[k].innerText)
      }
    }
    return ret
  }, [id, selector], function (returnValues) {
    value.map(function (item, index) {
      if (returnValues.value.length) {
        var testValue = returnValues.value[index].replace(/\r\n/g, '').replace(/\t/g, '').replace(/\s/g, '')
        browser.assert.equal(testValue, value[index])
      } else {
        browser.assert.equal(item, '')
      }
    })
  })
  return browser
}

function assertPanelValue (id, browser, index, value) {
  var selector = id + ' .dropdownpanel .dropdowncontent ul'
  browser.execute(function (id, index) {
    var node = document.querySelector(id)
    return node.children[index].innerText
  }, [selector, index], function (returnValues) {
    var testValue = returnValues.value.replace(/\r\n/g, '').replace(/\t/g, '').replace(/\s/g, '')
    browser.assert.equal(testValue, value)
  })
  return browser
}
