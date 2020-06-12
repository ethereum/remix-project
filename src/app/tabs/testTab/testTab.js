const helper = require('../../../lib/helper.js')
const modalDialogCustom = require('../../ui/modal-dialog-custom')

class TestTabLogic {

  constructor (fileManager) {
    this.fileManager = fileManager
    this.currentPath = 'browser/tests'
  }

  setCurrentPath(path) {
    this.currentPath = path
  }

  generateTestFile () {
    let fileName = this.fileManager.currentFile()
    const hasCurrent = !!fileName
    if (!fileName) fileName = this.currentPath + '/newFile.sol'
    const fileProvider = this.fileManager.fileProviderOf(this.currentPath)
    if (!fileProvider) return
    const splittedFileName = fileName.split('/')
    const fileNameToImport = (!hasCurrent) ? fileName : this.currentPath + '/' + splittedFileName[splittedFileName.length - 1]
    //const fileNameToImport = (!fileName) ? fileName : splittedFileName[splittedFileName.length - 1]
    helper.createNonClashingNameWithPrefix(fileNameToImport, fileProvider, '_test', (error, newFile) => {
      if (error) return modalDialogCustom.alert('Failed to create file. ' + newFile + ' ' + error)
      if (!fileProvider.set(newFile, this.generateTestContractSample(hasCurrent, fileNameToImport))) return modalDialogCustom.alert('Failed to create test file ' + newFile)
      this.fileManager.open(newFile)
    })
  }

  async getTests (cb) {
    if (!this.currentPath) return cb(null, [])
    const provider = this.fileManager.fileProviderOf(this.currentPath)
    if (!provider) return cb(null, [])
    const tests = []
    let files
    try {
      files = await this.fileManager.readdir(this.currentPath)
    } catch (e) {
      cb(e.message)
    }
    for (var file in files) {
      if (/.(_test.sol)$/.exec(file)) tests.push(provider.type + '/' + file)
    }
    cb(null, tests, this.currentPath)
  }

  // @todo(#2758): If currently selected file is compiled and compilation result is available,
  // 'contractName' should be <compiledContractName> + '_testSuite'
  generateTestContractSample (hasCurrent, fileToImport, contractName = 'testSuite') {
    const comment = hasCurrent ? `import "${fileToImport}";` : '// Import here the file to test.'
    return `pragma solidity >=0.4.22 <0.7.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
${comment}

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract ${contractName} {

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

    function checkSuccess2() public pure returns (bool) {
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
