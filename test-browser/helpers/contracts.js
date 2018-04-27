'use strict'
var deepequal = require('deep-equal')

module.exports = {
  getCompiledContracts: getCompiledContracts,
  testContracts: testContracts,
  addFile: addFile,
  switchFile: switchFile,
  verifyContract: verifyContract,
  testFunction,
  checkDebug,
  goToVMtraceStep,
  useFilter,
  addInstance,
  clickFunction,
  verifyCallReturnValue,
  createContract,
  modalFooterOKClick,
  setEditorValue,
  getEditorValue,
  testEditorValue,
  renameFile,
  removeFile
}

function getCompiledContracts (browser, compiled, callback) {
  browser.execute(function () {
    var contracts = document.querySelectorAll('#compileTabView select option')
    if (!contracts) {
      return null
    } else {
      var ret = []
      for (var c = 0; c < contracts.length; c++) {
        ret.push(contracts[c].innerHTML)
      }
      return ret
    }
  }, [], function (result) {
    callback(result)
  })
}

function createContract (browser, inputParams, callback) {
  browser.click('.runView')
  .setValue('div[class^="contractActionsContainerSingle"] input', inputParams, function () {
    browser.click('#runTabView button[class^="instanceButton"]').pause(500).perform(function () { callback() })
  })
}

function verifyContract (browser, compiledContractNames, callback) {
  getCompiledContracts(browser, compiledContractNames, (result) => {
    if (result.value) {
      for (var contract in compiledContractNames) {
        console.log(' - ' + result.value)
        console.log(' - ' + compiledContractNames[contract])
        if (result.value.indexOf(compiledContractNames[contract]) === -1) {
          browser.assert.fail('compiled contract ' + compiledContractNames + ' not found', 'info about error', '')
          browser.end()
          return
        }
      }
    } else {
      browser.assert.fail('compiled contract ' + compiledContractNames + ' not found - none found', 'info about error', '')
      browser.end()
    }
    console.log('contracts all found ' + result.value)
    callback()
  })
}

function testContracts (browser, fileName, contractCode, compiledContractNames, callback) {
  browser
    .click('.compileView')
    .clearValue('#input textarea')
    .perform((client, done) => {
      addFile(browser, fileName, contractCode, done)
    })
    .pause(1000)
    .perform(function () {
      verifyContract(browser, compiledContractNames, callback)
    })
}

function clickFunction (fnFullName, expectedInput) {
  this.waitForElementPresent('.instance button[title="' + fnFullName + '"]')
    .perform(function (client, done) {
      client.execute(function () {
        document.querySelector('#optionViews').scrollTop = document.querySelector('#optionViews').scrollHeight
      }, [], function () {
        if (expectedInput) {
          client.setValue('#runTabView input[title="' + expectedInput.types + '"]', expectedInput.values, function () {})
        }
        done()
      })
    })
    .click('.instance button[title="' + fnFullName + '"]')
    .pause(500)
  return this
}

function verifyCallReturnValue (browser, address, checks, done) {
  browser.execute(function (address) {
    var nodes = document.querySelectorAll('#instance' + address + ' div[class^="contractActionsContainer"] div[class^="value"]')
    var ret = []
    for (var k = 0; k < nodes.length; k++) {
      var text = nodes[k].innerText ? nodes[k].innerText : nodes[k].textContent
      ret.push(text.replace('\n', ''))
    }
    return ret
  }, [address], function (result) {
    for (var k in checks) {
      browser.assert.equal(result.value[k], checks[k])
    }
    done()
  })
}

function testFunction (fnFullName, txHash, log, expectedInput, expectedReturn, expectedEvent, callback) {
  // this => browser
  this.waitForElementPresent('.instance button[title="' + fnFullName + '"]')
    .perform(function (client, done) {
      client.execute(function () {
        document.querySelector('#optionViews').scrollTop = document.querySelector('#optionViews').scrollHeight
      }, [], function () {
        if (expectedInput) {
          client.setValue('#runTabView input[title="' + expectedInput.types + '"]', expectedInput.values, function () {})
        }
        done()
      })
    })
    .click('.instance button[title="' + fnFullName + '"]')
    .pause(500)
    .waitForElementPresent('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"]')
    .assert.containsText('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"] span', log)
    .click('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"] div[class^="log"]')
    .perform(function (client, done) {
      if (expectedReturn) {
        client.getText('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"] table[class^="txTable"] #decodedoutput', (result) => {
          console.log(result)
          var equal = deepequal(JSON.parse(result.value), JSON.parse(expectedReturn))
          if (!equal) {
            client.assert.fail('expected ' + expectedReturn + ' got ' + result.value, 'info about error', '')
          }
        })
      }
      done()
    })
    .perform(function (client, done) {
      if (expectedEvent) {
        client.getText('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"] table[class^="txTable"] #logs', (result) => {
          console.log(result)
          var equal = deepequal(JSON.parse(result.value), JSON.parse(expectedEvent))
          if (!equal) {
            client.assert.fail('expected ' + expectedEvent + ' got ' + result.value, 'info about error', '')
          }
        })
      }
      done()
      if (callback) callback()
    })
  return this
}

function setEditorValue (value, callback) {
  this.perform((client, done) => {
    this.execute(function (value) {
      document.getElementById('input').editor.session.setValue(value)
    }, [value], function (result) {
      done()
      if (callback) callback()
    })
  })
  return this
}

function addInstance (browser, address, isValidFormat, isValidChecksum, callback) {
  browser.clearValue('.ataddressinput').setValue('.ataddressinput', address, function () {
    browser.click('div[class^="atAddress"]')
      .execute(function () {
        var ret = document.querySelector('div[class^="modalBody"] div').innerHTML
        document.querySelector('#modal-footer-ok').click()
        return ret
      }, [], function (result) {
        if (!isValidFormat) {
          browser.assert.equal(result.value, 'Invalid address.')
        } else if (!isValidChecksum) {
          browser.assert.equal(result.value, 'Invalid checksum address.')
        }
        callback()
      })
  })
}

function getEditorValue (callback) {
  this.perform((client, done) => {
    this.execute(function (value) {
      return document.getElementById('input').editor.getValue()
    }, [], function (result) {
      done(result.value)
      callback(result.value)
    })
  })
  return this
}

function testEditorValue (testvalue, callback) {
  this.getEditorValue((value) => {
    this.assert.equal(testvalue, value)
    callback()
  })
}

function modalFooterOKClick () {
  this.perform((client, done) => {
    this.execute(function () {
      document.querySelector('#modal-footer-ok').click()
    }, [], function (result) {
      done()
    })
  })
  return this
}

function addFile (browser, name, content, done) {
  browser.click('.newFile')
    .perform((client, done) => {
      browser.execute(function (fileName) {
        if (fileName !== 'Untitled.sol') {
          document.querySelector('#modal-dialog #prompt_text').setAttribute('value', fileName)
        }
        document.querySelector('#modal-footer-ok').click()
      }, [name], function (result) {
        console.log(result)
        done()
      })
    })
    .setEditorValue(content.content)
    .pause(1000)
    .perform(function () {
      done()
    })
}

function renameFile (browser, path, newFileName, renamedPath, done) {
  browser.execute(function (path) {
    function contextMenuClick (element) {
      var evt = element.ownerDocument.createEvent('MouseEvents')
      var RIGHT_CLICK_BUTTON_CODE = 2 // the same for FF and IE
      evt.initMouseEvent('contextmenu', true, true,
          element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
          false, false, false, RIGHT_CLICK_BUTTON_CODE, null)
      if (document.createEventObject) {
        // dispatch for IE
        return element.fireEvent('onclick', evt)
      } else {
        // dispatch for firefox + others
        return !element.dispatchEvent(evt)
      }
    }
    contextMenuClick(document.querySelector('[data-path="' + path + '"]'))
  }, [path], function (result) {
    browser
    .click('#menuitemrename')
    .perform((client, doneSetValue) => {
      browser.execute(function (path, addvalue) {
        document.querySelector('[data-path="' + path + '"]').innerHTML = addvalue
      }, [path, newFileName], () => {
        doneSetValue()
      })
    })
    .click('body') // blur
    .pause(500)
    .click('#modal-footer-ok')
    .waitForElementNotPresent('[data-path="' + path + '"]')
    .waitForElementPresent('[data-path="' + renamedPath + '"]')
    .perform(() => {
      done()
    })
  })
}

function removeFile (browser, path, done) {
  browser.execute(function (path, value) {
    function contextMenuClick (element) {
      var evt = element.ownerDocument.createEvent('MouseEvents')
      var RIGHT_CLICK_BUTTON_CODE = 2 // the same for FF and IE
      evt.initMouseEvent('contextmenu', true, true,
          element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
          false, false, false, RIGHT_CLICK_BUTTON_CODE, null)
      if (document.createEventObject) {
        // dispatch for IE
        return element.fireEvent('onclick', evt)
      } else {
        // dispatch for firefox + others
        return !element.dispatchEvent(evt)
      }
    }
    contextMenuClick(document.querySelector('[data-path="' + path + '"]'))
  }, [path], function (result) {
    browser
    .click('#menuitemdelete')
    .pause(500)
    .click('#modal-footer-ok')
    .waitForElementNotPresent('[data-path="' + path + '"]')
    .perform(() => {
      done()
    })
  })
}

function useFilter (browser, filter, test, done) {
  if (browser.options.desiredCapabilities.browserName === 'chrome') { // nightwatch deos not handle well that part.... works locally
    done()
    return
  }
  var filterClass = '#editor-container div[class^="search"] input[class^="filter"]'
  browser.setValue(filterClass, filter, function () {
    browser.execute(function () {
      return document.querySelector('#editor-container div[class^="journal"]').innerHTML === test
    }, [], function (result) {
      browser.clearValue(filterClass).setValue(filterClass, '', function () {
        if (!result.value) {
          browser.assert.fail('useFilter on ' + filter + ' ' + test, 'info about error', '')
        }
        done()
      })
    })
  })
}

function switchFile (browser, name, done) {
  browser
    .useXpath()
    .click('//ul[@id="files"]//span[text()="' + name + '"]')
    .useCss()
    .pause(2000)
    .perform(function () {
      done()
    })
}

function checkDebug (browser, id, debugValue, done) {
  // id is soliditylocals or soliditystate
  browser.execute(function (id) {
    return document.querySelector('#' + id + ' .dropdownrawcontent').innerText
  }, [id], function (result) {
    console.log(id + ' ' + result.value)
    var value
    try {
      value = JSON.parse(result.value)
    } catch (e) {
      browser.assert.fail('cant parse solidity state', e.message, '')
      done()
      return
    }
    var equal = deepequal(debugValue, value)
    if (!equal) {
      browser.assert.fail('checkDebug on ' + id, 'info about error', '')
    }
    done()
  })
}

function goToVMtraceStep (browser, step, done, incr) {
  if (!incr) incr = 0
  browser.execute(function (step) {
    return document.querySelector('#stepdetail').innerHTML
  }, [step], function (result) {
    if (result.value.indexOf('vm trace step: ' + step) !== -1) {
      done()
    } else if (incr > 1000) {
      console.log(result)
      browser.assert.fail('goToVMtraceStep fails', 'info about error', '')
      done()
    } else {
      incr++
      browser.click('#intoforward')
        .perform(() => {
          setTimeout(() => {
            goToVMtraceStep(browser, step, done, incr)
          }, 200)
        })
    }
  })
}
