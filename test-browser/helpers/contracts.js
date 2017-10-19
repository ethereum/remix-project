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
  goToVMtraceStep
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

function testFunction (fnFullName, txHash, log, expectedInput, expectedReturn, expectedEvent) {
  // this => browser
  this.waitForElementPresent('.instance button[title="' + fnFullName + '"]')
    .perform(function (client, done) {
      if (expectedInput) {
        client.setValue('#runTabView input[title="' + expectedInput.types + '"]', expectedInput.values, function () {})
      }
      done()
    })
    .click('.instance button[title="' + fnFullName + '"]')
    .pause(500)
    .waitForElementPresent('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"]')
    .assert.containsText('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"] span', log)
    .click('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"] button[class^="details"]')
    .perform(function (client, done) {
      if (expectedReturn) {
        client.assert.containsText('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"] table[class^="txTable"] #decodedoutput', expectedReturn)
      }
      done()
    })
    .perform(function (client, done) {
      if (expectedEvent) {
        client.assert.containsText('#editor-container div[class^="terminal"] span[id="tx' + txHash + '"] table[class^="txTable"] #logs', expectedEvent)
      }
      done()
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
    .setValue('#input textarea', content, function () {})
    .pause(1000)
    .perform(function () {
      done()
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
    var value = JSON.parse(result.value)
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
