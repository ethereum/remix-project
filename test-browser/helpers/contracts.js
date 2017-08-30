'use strict'

module.exports = {
  checkCompiledContracts: checkCompiledContracts,
  testContracts: testContracts
}

function checkCompiledContracts (browser, compiled, callback) {
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
    if (!result.value) {
      browser.end('no compiled contracts')
    } else {
      result.value.map(function (item, i) {
        browser.assert.equal(item, compiled[i])
      })
    }
    callback()
  })
}

function testContracts (browser, contractCode, compiledContractNames, callback) {
  browser
      .clearValue('#input textarea')
      .click('.newFile')
      .setValue('#input textarea', contractCode, function () {})
      .waitForElementPresent('#compileTabView select option', 50000, true, function () {
        checkCompiledContracts(browser, compiledContractNames, callback)
      })
}
