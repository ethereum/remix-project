'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')
var async = require('async')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Simple Contract': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser) {
  browser.setEditorValue = contractHelper.setEditorValue
  browser.getEditorValue = contractHelper.getEditorValue
  browser.clickLaunchIcon = contractHelper.clickLaunchIcon
  browser.scrollInto = contractHelper.scrollInto
  browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('solidity')
    .clickLaunchIcon('fileExplorers')
    .perform(() => {
      // the first fn is used to pass browser to the other ones.
      async.waterfall([function (callback) { callback(null, browser) },
        testSimpleContract,
        testSuccessImport,
        testFailedImport, /* testGitHubImport */
        addDeployLibTestFile,
        testAutoDeployLib,
        testManualDeployLib
      ],
      function () {
        browser.end()
      })
    })
}

function testSimpleContract (browser, callback) {
  console.log('testSimpleContract')
  contractHelper.testContracts(browser, 'Untitled.sol', sources[0]['browser/Untitled.sol'], ['test1', 'test2'], function () {
    callback(null, browser)
  })
}

function testSuccessImport (browser, callback) {
  console.log('testSuccessImport')
  contractHelper.addFile(browser, 'Untitled1.sol', sources[1]['browser/Untitled1.sol'], () => {
    contractHelper.addFile(browser, 'Untitled2.sol', sources[1]['browser/Untitled2.sol'], () => {
      contractHelper.switchFile(browser, 'browser/Untitled1.sol', function () {
        contractHelper.verifyContract(browser, ['test6', 'test4', 'test5'], function () {
          callback(null, browser)
        })
      })
    })
  })
}

function testFailedImport (browser, callback) {
  console.log('testFailedImport')
  contractHelper.addFile(browser, 'Untitled3.sol', sources[2]['browser/Untitled3.sol'], () => {
    browser.clickLaunchIcon('solidity').assert.containsText('#compileTabView .error pre', 'Unable to import "browser/Untitled11.sol": File not found')
    .perform(function () {
      callback(null, browser)
    })
  })
}

function addDeployLibTestFile (browser, callback) {
  contractHelper.addFile(browser, 'Untitled5.sol', sources[5]['browser/Untitled5.sol'], () => {
    callback(null, browser)
  })
}

function testAutoDeployLib (browser, callback) {
  console.log('testAutoDeployLib')
  contractHelper.verifyContract(browser, ['test'], () => {
    contractHelper.selectContract(browser, 'test', () => {
      contractHelper.createContract(browser, '', () => {
        contractHelper.getAddressAtPosition(browser, 0, (address) => {
          console.log(address)
          browser.waitForElementPresent('.instance:nth-of-type(2)').click('.instance:nth-of-type(2) > div > button').perform(() => {
            contractHelper.testConstantFunction(browser, address, 'get - call', '', '0: uint256: 45', () => { callback(null, browser) })
          })
        })
      })
    })
  })
}

function testManualDeployLib (browser, callback) {
  console.log('testManualDeployLib')
  browser.click('i[class^="clearinstance"]').pause(5000).clickLaunchIcon('settings').click('#generatecontractmetadata').perform(() => {
    browser.clickLaunchIcon('solidity').click('#compileTabView button[title="Compile"]').perform(() => { // that should generate the JSON artefact
      contractHelper.verifyContract(browser, ['test'], () => {
        contractHelper.selectContract(browser, 'lib', () => { // deploy lib
          contractHelper.createContract(browser, '', () => {
            contractHelper.getAddressAtPosition(browser, 0, (address) => {
              console.log('address:', address)
              checkDeployShouldFail(browser, () => {
                checkDeployShouldSucceed(browser, address, () => {
                  callback(null, browser)
                })
              })
            })
          })
        })
      })
    })
  })
}

function checkDeployShouldFail (browser, callback) {
  contractHelper.switchFile(browser, 'browser/test.json', () => {
    browser.getEditorValue((content) => {
      var config = JSON.parse(content)
      config.deploy['VM:-'].autoDeployLib = false
      browser.setEditorValue(JSON.stringify(config), () => {
        contractHelper.switchFile(browser, 'browser/Untitled5.sol', () => {
          contractHelper.selectContract(browser, 'test', () => { // deploy lib
            contractHelper.createContract(browser, '', () => {
              browser.assert.containsText('div[class^="terminal"]', '<address> is not a valid address').perform(() => { callback() })
            })
          })
        })
      })
    })
  })
}

function checkDeployShouldSucceed (browser, address, callback) {
  contractHelper.switchFile(browser, 'browser/test.json', () => {
    browser.getEditorValue((content) => {
      var config = JSON.parse(content)
      config.deploy['VM:-'].autoDeployLib = false
      config.deploy['VM:-']['linkReferences']['browser/Untitled5.sol'].lib = address
      browser.setEditorValue(JSON.stringify(config), () => {
        contractHelper.switchFile(browser, 'browser/Untitled5.sol', () => {
          contractHelper.selectContract(browser, 'test', () => { // deploy lib
            contractHelper.createContract(browser, '', () => {
              contractHelper.getAddressAtPosition(browser, 1, (address) => {
                browser.waitForElementPresent('.instance:nth-of-type(3)')
                .click('.instance:nth-of-type(3) > div > button').perform(() => {
                  contractHelper.testConstantFunction(browser, address, 'get - call', '', '0: uint256: 45', () => { callback(null, browser) })
                })
              })
            })
          })
        })
      })
    })
  })
}

/*
function testGitHubImport (browser, callback) {
  contractHelper.addFile(browser, 'Untitled4.sol', sources[3]['browser/Untitled4.sol'], () => {
    browser.pause(10000)
    .perform(function () {
      contractHelper.verifyContract(browser, ['browser/Untitled4.sol:test7', 'github.com/ethereum/ens/contracts/AbstractENS.sol:AbstractENS', 'github.com/ethereum/ens/contracts/ENS.sol:ENS'], function () {
        callback(null, browser)
      })
    })
  })
}
*/

var abstractENS = `
contract AbstractENS {
    function owner(bytes32 node) public view returns(address);
    function resolver(bytes32 node) public view returns(address);
    function ttl(bytes32 node) public view returns(uint64);
    function setOwner(bytes32 node, address owner) public;
    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) public;
    function setResolver(bytes32 node, address resolver) public;
    function setTTL(bytes32 node, uint64 ttl) public;

    // Logged when the owner of a node assigns a new owner to a subnode.
    event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner);

    // Logged when the owner of a node transfers ownership to a new account.
    event Transfer(bytes32 indexed node, address owner);

    // Logged when the resolver for a node changes.
    event NewResolver(bytes32 indexed node, address resolver);

    // Logged when the TTL of a node changes
    event NewTTL(bytes32 indexed node, uint64 ttl);
}`

var ENS = `pragma solidity ^0.4.0;

import './AbstractENS.sol';

/**
 * The ENS registry contract.
 */
contract ENS is AbstractENS {
  struct Record {
      address owner;
      address resolver;
      uint64 ttl;
  }

  mapping(bytes32=>Record) records;

  // Permits modifications only by the owner of the specified node.
  modifier only_owner(bytes32 node) {
      if (records[node].owner != msg.sender) revert();
      _;
  }

  /**
   * Constructs a new ENS registrar.
   */
  constructor() public {
      records[0].owner = msg.sender;
  }

  /**
   * Returns the address that owns the specified node.
   */
  function owner(bytes32 node) public view returns (address) {
      return records[node].owner;
  }

  /**
   * Returns the address of the resolver for the specified node.
   */
  function resolver(bytes32 node) public view returns (address) {
      return records[node].resolver;
  }

  /**
   * Returns the TTL of a node, and any records associated with it.
   */
  function ttl(bytes32 node) public view returns (uint64) {
      return records[node].ttl;
  }

  /**
   * Transfers ownership of a node to a new address. May only be called by the current
   * owner of the node.
   * @param node The node to transfer ownership of.
   * @param owner The address of the new owner.
   */
  function setOwner(bytes32 node, address owner) public only_owner(node) {
      emit Transfer(node, owner);
      records[node].owner = owner;
  }

  /**
   * Transfers ownership of a subnode sha3(node, label) to a new address. May only be
   * called by the owner of the parent node.
   * @param node The parent node.
   * @param label The hash of the label specifying the subnode.
   * @param owner The address of the new owner.
   */
  function setSubnodeOwner(bytes32 node, bytes32 label, address owner) public only_owner(node) {
      bytes32 subnode = keccak256(abi.encodePacked(node, label));
      emit NewOwner(node, label, owner);
      records[subnode].owner = owner;
  }

  /**
   * Sets the resolver address for the specified node.
   * @param node The node to update.
   * @param resolver The address of the resolver.
   */
  function setResolver(bytes32 node, address resolver) public only_owner(node) {
      emit NewResolver(node, resolver);
      records[node].resolver = resolver;
  }

  /**
   * Sets the TTL for the specified node.
   * @param node The node to update.
   * @param ttl The TTL in seconds.
   */
  function setTTL(bytes32 node, uint64 ttl) public only_owner(node) {
      emit NewTTL(node, ttl);
      records[node].ttl = ttl;
  }
}`

var sources = [
  {
    'browser/Untitled.sol': {content: 'contract test1 {} contract test2 {}'}
  },
  {
    'browser/Untitled1.sol': {content: 'import "./Untitled2.sol"; contract test6 {}'},
    'browser/Untitled2.sol': {content: 'contract test4 {} contract test5 {}'}
  },
  {
    'browser/Untitled3.sol': {content: 'import "./Untitled11.sol"; contract test6 {}'}
  },
  {
    'browser/Untitled4.sol': {content: 'import "github.com/ethereum/ens/contracts/ENS.sol"; contract test7 {}'},
    'github.com/ethereum/ens/contracts/ENS.sol': {content: ENS}
  },
  {
    'browser/Untitled4.sol': {content: 'import "github.com/ethereum/ens/contracts/ENS.sol"; contract test7 {}'},
    'github.com/ethereum/ens/contracts/ENS.sol': {content: ENS},
    'github.com/ethereum/ens/contracts/AbstractENS.sol': {content: abstractENS}
  },
  {
    'browser/Untitled5.sol': {content: `library lib {
      function getInt () public view returns (uint) {
          return 45;
      }    
    }

    contract test {
      function get () public view returns (uint) {
          return lib.getInt();
      }    
}`}
  }
]
