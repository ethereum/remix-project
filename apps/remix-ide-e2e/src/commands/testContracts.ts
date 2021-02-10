import { NightwatchBrowser, NightwatchContractContent } from 'nightwatch'
import EventEmitter from 'events'

class TestContracts extends EventEmitter {
  command (this: NightwatchBrowser, fileName: string, contractCode: NightwatchContractContent, compiledContractNames: string[]): NightwatchBrowser {
    this.api.perform((done) => {
      testContracts(this.api, fileName, contractCode, compiledContractNames, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function testContracts (browser: NightwatchBrowser, fileName: string, contractCode: NightwatchContractContent, compiledContractNames: string[], callback: VoidFunction) {
  browser
    .clickLaunchIcon('solidity')
    .addFile(fileName, contractCode)
    .pause(1000)
    .verifyContracts(compiledContractNames)
    .perform(() => {
      callback()
    })
}

module.exports = TestContracts
