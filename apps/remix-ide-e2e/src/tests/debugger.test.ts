'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {

  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should launch debugger': function (browser: NightwatchBrowser) {
    browser.addFile('blah.sol', sources[0]['browser/blah.sol'])
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[title="Deploy - transact (not payable)"]')
    .click('*[title="Deploy - transact (not payable)"]')
    .debugTransaction(0)
    .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'DEBUGGER')
  },

  'Should debug failing transaction': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindudapp"]')
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="universalDappUiTitleExpander"]')
    .click('*[data-id="universalDappUiTitleExpander"]')
    .scrollAndClick('*[title="string name, uint256 goal"]')
    .setValue('*[title="string name, uint256 goal"]', '"toast", 999')
    .click('*[data-id="createProject - transact (not payable)"]')
    .debugTransaction(1)
    .pause(2000)
    .scrollAndClick('*[data-id="solidityLocals"]')
    .assert.containsText('*[data-id="solidityLocals"]', 'toast')
    .assert.containsText('*[data-id="solidityLocals"]', '999')
  },

  'Should debug transaction using slider': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindudapp"]')
    .waitForElementVisible('*[data-id="slider"]')
    .click('*[data-id="slider"]')
    .setValue('*[data-id="slider"]', '50')
    .pause(2000)
    .assert.containsText('*[data-id="solidityLocals"]', 'no locals')
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step:\n92')
  },

  'Should step back and forward transaction': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindudapp"]')
    .waitForElementPresent('*[data-id="buttonNavigatorIntoBack"]')
    .scrollAndClick('*[data-id="buttonNavigatorIntoBack"]')
    .pause(2000)
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step:\n91')
    .assert.containsText('*[data-id="stepdetail"]', 'execution step:\n91')
    .click('*[data-id="buttonNavigatorIntoForward"]')
    .pause(2000)
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step:\n92')
    .assert.containsText('*[data-id="stepdetail"]', 'execution step:\n92')
  },

  'Should jump through breakpoints': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="editorInput"]')
    .click('.ace_gutter-cell:nth-of-type(10)')
    .click('.ace_gutter-cell:nth-of-type(20)')
    .waitForElementVisible('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
    .click('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
    .pause(2000)
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step:\n0')
    .assert.containsText('*[data-id="stepdetail"]', 'execution step:\n0')
    .click('*[data-id="buttonNavigatorJumpNextBreakpoint"]')
    .pause(2000)
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step:\n184')
    .assert.containsText('*[data-id="stepdetail"]', 'execution step:\n184')    
  },

  'Should display solidity imported code while debugging github import': function (browser: NightwatchBrowser) {
    browser
    .clickLaunchIcon('solidity')
    .setSolidityCompilerVersion('soljson-v0.6.12+commit.27d51765.js')
    .clickLaunchIcon('udapp')    
    .testContracts('externalImport.sol', sources[1]['browser/externalImport.sol'], ['ERC20'])
    .selectContract('ERC20')
    .createContract('"tokenName", "symbol"')
    .debugTransaction(2)
    .pause(2000)
    .goToVMTraceStep(10)
    .getEditorValue((content) => {
      browser.assert.ok(content.indexOf(`constructor (string memory name, string memory symbol) public {
        _name = name;
        _symbol = symbol;
        _decimals = 18;
    }`) != -1, 
    'current displayed content is not from the ERC20 source code')
    })        
  },

  'Should display correct source highlighting while debugging a contract which has ABIEncoderV2': function (browser: NightwatchBrowser) {
    /*
      localVariable_step266_ABIEncoder and localVariable_step717_ABIEncoder
      still contains unwanted values (related to decoding calldata types)
      This is still an issue @todo(https://github.com/ethereum/remix-project/issues/481), so this test will fail when this issue is fixed
    */
    browser
    .clickLaunchIcon('solidity')
    .setSolidityCompilerVersion('soljson-v0.6.12+commit.27d51765.js')
    .clickLaunchIcon('udapp')
    .testContracts('withABIEncoderV2.sol', sources[2]['browser/withABIEncoderV2.sol'], ['test'])
    .selectContract('test')
    .createContract('')
    .clickInstance(2)
    .clickFunction('test1 - transact (not payable)', {types: 'bytes userData', values: '0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000015b38da6a701c568545dcfcb03fcb875f56beddc4'})
    .debugTransaction(4)
    .pause(2000)    
    .goToVMTraceStep(261)
    .pause(1000)
    /*
      for the test below:
      source highlight should remain line `bytes32 idAsk = abi.decode(userData[:33], (bytes32));`
      At this vmtrace index, the sourcemap has file = -1 because the execution is in the generated sources (ABIEncoderV2)
      the atIndex of SourceLocationTracker was buggy and return an incorrect value, this is fixed
      But the debugger uses now validSourcelocation, which means file is not -1.
      In that case the source highlight at 261 should be the same as for step 262
    */
    .waitForElementPresent('.highlightLine7') 
    .goToVMTraceStep(266)
    .pause(1000)
    .checkVariableDebug('soliditylocals', localVariable_step266_ABIEncoder) // locals should not be initiated at this point, only idAsk should
    .goToVMTraceStep(717)
    .pause(5000)
    .checkVariableDebug('soliditylocals', localVariable_step717_ABIEncoder) // all locals should be initiaed
    .end()
  },

  tearDown: sauce
}

const sources = [
  {
    'browser/blah.sol': {
      content: `
    pragma solidity >=0.4.22 <0.6.0;

    contract Kickstarter {

        enum State { Started, Completed }

        struct Project {
            address owner;
            string name;
            uint goal;
            State state;
        }    

        Project[] public projects;    

        constructor() public {

        }    

        function createProject(string memory name, uint goal) public {
            Project storage project = projects[projects.length];
            project.name = name;
            project.owner = msg.sender;
            project.state = State.Started;
            project.goal = goal;
        }
    }
        `
    }
  },
  {
    'browser/externalImport.sol': {content: 'import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol"; contract test7 {}'}
  },
  {
    'browser/withABIEncoderV2.sol': {content: `
    pragma experimental ABIEncoderV2;

    contract test {
    // 000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000015b38da6a701c568545dcfcb03fcb875f56beddc4
    // 0000000000000000000000000000000000000000000000000000000000000002
    function test1 (bytes calldata userData) external returns (bytes memory, bytes32, bytes32, uint) {
        bytes32 idAsk = abi.decode(userData[:33], (bytes32));
        bytes32 idOffer = abi.decode(userData[32:64], (bytes32));
              
        bytes memory ro  = abi.encodePacked(msg.sender, msg.sender, idAsk, idOffer);
        return (ro, idAsk, idOffer, userData.length);
    }
    
    
    function testgp (bytes calldata userData) external returns (bytes4) {
        return  abi.decode(userData[:4], (bytes4));
    }
}
    `}
  }
]

const localVariable_step266_ABIEncoder = {
  "<1>": {
      "length": "0xNaN",
      "type": "bytes",
      "value": "0x"
  },
  "<2>": {
      "type": "bytes32",
      "value": "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  "<3>": {
      "type": "bytes32",
      "value": "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  "<4>": {
      "type": "uint256",
      "value": "0"
  },
  "idAsk": {
      "type": "bytes32",
      "value": "0x0000000000000000000000000000000000000000000000000000000000000002"
  },
  "userData": {
      "error": "<decoding failed - no decoder for calldata>",
      "type": "bytes"
  }
}

const localVariable_step717_ABIEncoder = {
  "<1>": {
      "length": "0xd0",
      "type": "bytes",
      "value": "0x5b38da6a701c568545dcfcb03fcb875f56beddc45b38da6a701c568545dcfcb03fcb875f56beddc400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001"
  },
  "<2>": {
      "type": "bytes32",
      "value": "0x0000000000000000000000000000000000000000000000000000000000000002"
  },
  "<3>": {
      "type": "bytes32",
      "value": "0x0000000000000000000000000000000000000000000000000000000000000001"
  },
  "<4>": {
      "type": "uint256",
      "value": "84"
  },
  "idAsk": {
      "type": "bytes32",
      "value": "0x0000000000000000000000000000000000000000000000000000000000000002"
  },
  "idOffer": {
      "type": "bytes32",
      "value": "0x0000000000000000000000000000000000000000000000000000000000000001"
  },
  "ro": {
      "length": "0xd0",
      "type": "bytes",
      "value": "0x5b38da6a701c568545dcfcb03fcb875f56beddc45b38da6a701c568545dcfcb03fcb875f56beddc400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001"
  },
  "userData": {
      "error": "<decoding failed - no decoder for calldata>",
      "type": "bytes"
  }
}