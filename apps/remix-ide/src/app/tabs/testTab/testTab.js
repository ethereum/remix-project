const helper = require('../../../lib/helper.js')
const modalDialogCustom = require('../../ui/modal-dialog-custom')
const remixPath = require('path')

class TestTabLogic {
  constructor (fileManager) {
    this.fileManager = fileManager
    this.currentPath = 'browser/tests'
  }

  setCurrentPath (path) {
    if (path.indexOf('/') === 0) return
    this.currentPath = path
    const fileProvider = this.fileManager.fileProviderOf(path.split('/')[0])
    fileProvider.exists(path, (e, res) => { if (!res) fileProvider.createDir(path) })
  }

  generateTestFile () {
    let fileName = this.fileManager.currentFile()
    const hasCurrent = !!fileName && this.fileManager.currentFile().split('.').pop().toLowerCase() === 'sol'
    if (!hasCurrent) fileName = this.currentPath + '/newFile.sol'
    const fileProvider = this.fileManager.fileProviderOf(this.currentPath)
    if (!fileProvider) return
    const splittedFileName = fileName.split('/')
    const fileNameToImport = (!hasCurrent) ? fileName : this.currentPath + '/' + splittedFileName[splittedFileName.length - 1]
    helper.createNonClashingNameWithPrefix(fileNameToImport, fileProvider, '_test', (error, newFile) => {
      if (error) return modalDialogCustom.alert('Failed to create file. ' + newFile + ' ' + error)
      if (!fileProvider.set(newFile, this.generateTestContractSample(hasCurrent, fileName))) return modalDialogCustom.alert('Failed to create test file ' + newFile)
      this.fileManager.open(newFile)
      this.fileManager.syncEditor(newFile)
    })
  }

  dirList (path) {
    return this.fileManager.dirList(path)
  }

  isRemixDActive () {
    return this.fileManager.isRemixDActive()
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
    let relative = remixPath.relative(this.currentPath, remixPath.dirname(fileToImport))
    if (relative === '') relative = '.'
    const comment = hasCurrent ? `import "${relative}/${remixPath.basename(fileToImport)}";` : '// Import here the file to test.'
    return `// SPDX-License-Identifier: GPL-3.0
    
pragma solidity >=0.4.22 <0.9.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol";
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

    /// Custom Transaction Context
    /// See more: https://remix-ide.readthedocs.io/en/latest/unittesting.html#customization
    /// #sender: account-1
    /// #value: 100
    function checkSenderAndValue() public payable {
        // account index varies 0-9, value is in wei
        Assert.equal(msg.sender, TestsAccounts.getAccount(1), "Invalid sender");
        Assert.equal(msg.value, 100, "Invalid value");
    }
}
`
  }
}

module.exports = TestTabLogic
