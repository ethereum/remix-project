var helper = require('../../../lib/helper.js')
var modalDialogCustom = require('../../ui/modal-dialog-custom')

class TestTabLogic {

  constructor (fileManager) {
    this.fileManager = fileManager
  }

  generateTestFile () {
    var path = this.fileManager.currentPath()
    var fileProvider = this.fileManager.fileProviderOf(path)
    if (!fileProvider) return
    helper.createNonClashingNameWithPrefix(path + '/test.sol', fileProvider, '_test', (error, newFile) => {
      if (error) return modalDialogCustom.alert('Failed to create file. ' + newFile + ' ' + error)
      if (!fileProvider.set(newFile, this.generateTestContractSample())) return modalDialogCustom.alert('Failed to create test file ' + newFile)
      this.fileManager.switchFile(newFile)
    })
  }

  async getTests (cb) {
    var path = this.fileManager.currentPath()
    if (!path) return cb(null, [])
    var provider = this.fileManager.fileProviderOf(path)
    if (!provider) return cb(null, [])
    var tests = []
    let files
    try {
      files = await this.fileManager.getFolder(path)
    } catch (e) {
      cb(e.message)
    }
    for (var file in files) {
      if (/.(_test.sol)$/.exec(file)) tests.push(provider.type + '/' + file)
    }
    cb(null, tests)
  }

  generateTestContractSample () {
    return `pragma solidity >=0.4.0 <0.6.0;
      import "remix_tests.sol"; // this import is automatically injected by Remix.

      // file name has to end with '_test.sol'
      contract test_1 {

        function beforeAll() public {
          // here should instantiate tested contract
          Assert.equal(uint(4), uint(3), "error in before all function");
        }

        function check1() public {
          // use 'Assert' to test the contract
          Assert.equal(uint(2), uint(1), "error message");
          Assert.equal(uint(2), uint(2), "error message");
        }

        function check2() public view returns (bool) {
          // use the return value (true or false) to test the contract
          return true;
        }
      }

    contract test_2 {

      function beforeAll() public {
        // here should instantiate tested contract
        Assert.equal(uint(4), uint(3), "error in before all function");
      }

      function check1() public {
        // use 'Assert' to test the contract
        Assert.equal(uint(2), uint(1), "error message");
        Assert.equal(uint(2), uint(2), "error message");
      }

      function check2() public view returns (bool) {
        // use the return value (true or false) to test the contract
        return true;
      }
    }`
  }

}

module.exports = TestTabLogic
