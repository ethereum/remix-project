const helper = require('../../../lib/helper.js')
const modalDialogCustom = require('../../ui/modal-dialog-custom')

class TestTabLogic {

  constructor (fileManager) {
    this.fileManager = fileManager
  }

  generateTestFile () {
    const path = this.fileManager.currentPath()
    const fileName = this.fileManager.currentFile()
    const fileProvider = this.fileManager.fileProviderOf(path)
    if (!fileProvider) return
    helper.createNonClashingNameWithPrefix(fileName, fileProvider, '_test', (error, newFile) => {
      if (error) return modalDialogCustom.alert('Failed to create file. ' + newFile + ' ' + error)
      if (!fileProvider.set(newFile, this.generateTestContractSample())) return modalDialogCustom.alert('Failed to create test file ' + newFile)
      this.fileManager.switchFile(newFile)
    })
  }

  async getTests (cb) {
    const path = this.fileManager.currentPath()
    if (!path) return cb(null, [])
    const provider = this.fileManager.fileProviderOf(path)
    if (!provider) return cb(null, [])
    const tests = []
    let files
    try {
      files = await this.fileManager.getFolder(path)
    } catch (e) {
      cb(e.message)
    }
    for (var file in files) {
      if (/.(_test.sol)$/.exec(file)) tests.push(provider.type + '/' + file)
    }
    cb(null, tests, path)
  }

  generateTestContractSample () {
    return `pragma solidity >=0.4.0 <0.7.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.

// file name has to end with '_test.sol'
contract test_1 {

    /// 'beforeAll' runs before all other tests
    /// More special functions are: 'beforeEach', 'beforeAll', 'afterEach' & 'afterAll'
    function beforeAll() public {
        // Here should instantiate tested contract
        Assert.equal(uint(1), uint(1), "1 should be equal to 1");
    }

    function checkSuccess() public {
        // Use 'Assert' to test the contract, 
        // See documentation: https://remix-ide.readthedocs.io/en/latest/assert_library.html
        Assert.equal(uint(2), uint(2), "2 should be equal to 2");
        Assert.notEqual(uint(2), uint(3), "2 should not be equal to 3");
    }

    function checkSuccess2() public view returns (bool) {
        // Use the return value (true or false) to test the contract
        return true;
    }
    
    function checkFailure() public {
        Assert.equal(uint(1), uint(2), "1 is not equal to 2");
    }
}
`
  }

}

module.exports = TestTabLogic
