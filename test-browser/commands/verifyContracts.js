const EventEmitter = require('events')

class VerifyContracts extends EventEmitter {
  command (compiledContractNames) {
    this.api.perform((done) => {
      verifyContracts(this.api, compiledContractNames, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function getCompiledContracts (browser, callback) {
  browser.clickLaunchIcon('solidity').execute(function () {
    var contracts = document.querySelectorAll('#compileTabView select#compiledContracts option')
    if (!contracts) {
      return null
    } else {
      var ret = []
      for (var c = 0; c < contracts.length; c++) {
        ret.push(contracts[c].value)
      }
      return ret
    }
  }, [], function (result) {
    callback(result)
  })
}

function verifyContracts (browser, compiledContractNames, callback) {
  getCompiledContracts(browser, (result) => {
    if (result.value) {
      for (var contract in compiledContractNames) {
        console.log(' - ' + compiledContractNames[contract], result.value)
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
    console.log('contracts all found ' + compiledContractNames)
    callback()
  })
}

module.exports = VerifyContracts
