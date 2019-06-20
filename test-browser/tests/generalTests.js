'use strict'
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
  browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('solidity')
    .clickLaunchIcon('fileExplorers')
    .perform(() => {
      // the first fn is used to pass browser to the other ones.
      async.waterfall([function (callback) { callback(null, browser) },
        testSimpleContract,
        testSuccessImport,
        testFailedImport, /* testGitHubImport, */
        addDeployLibTestFile,
        testAutoDeployLib,
        testManualDeployLib,
        testSignature
      ],
      function () {
        browser.end()
      })
    })
}

function testSimpleContract (browser, callback) {
  console.log('testSimpleContract')
  browser.testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['test1', 'test2'])
  .perform(() => {
    callback(null, browser)
  })
}

function testSuccessImport (browser, callback) {
  console.log('testSuccessImport')
  browser.addFile('Untitled1.sol', sources[1]['browser/Untitled1.sol'])
        .addFile('Untitled2.sol', sources[1]['browser/Untitled2.sol'])
        .switchFile('browser/Untitled1.sol')
        .verifyContracts(['test6', 'test4', 'test5'])
        .perform(() => {
          callback(null, browser)
        })
}

function testFailedImport (browser, callback) {
  console.log('testFailedImport')
  browser.addFile('Untitled3.sol', sources[2]['browser/Untitled3.sol'])
        .clickLaunchIcon('solidity')
        .assert.containsText('#compileTabView .error pre', 'Unable to import "browser/Untitled11.sol": File not found')
        .perform(function () {
          callback(null, browser)
        })
}

function addDeployLibTestFile (browser, callback) {
  browser.addFile('Untitled5.sol', sources[5]['browser/Untitled5.sol'])
        .perform(() => {
          callback(null, browser)
        })
}

function testAutoDeployLib (browser, callback) {
  console.log('testAutoDeployLib')
  let addressRef
  browser.verifyContracts(['test'])
        .selectContract('test')
        .createContract('')
        .getAddressAtPosition(0, (address) => {
          console.log('testAutoDeployLib ' + address)
          addressRef = address
        })
        .waitForElementPresent('.instance:nth-of-type(2)')
        .click('.instance:nth-of-type(2) > div > button')
        .perform(() => {
          browser
          .testConstantFunction(addressRef, 'get - call', '', '0: uint256: 45')
          .perform(() => {
            callback(null, browser)
          })
        })
}

function testManualDeployLib (browser, callback) {
  console.log('testManualDeployLib')
  browser.click('i[class^="clearinstance"]')
        .pause(5000)
        .clickLaunchIcon('settings')
        .click('#generatecontractmetadata')
        .clickLaunchIcon('solidity')
        .click('#compileTabView button[title="Compile"]') // that should generate the JSON artefact
        .verifyContracts(['test'])
        .selectContract('lib') // deploy lib
        .createContract('')
        .getAddressAtPosition(0, (address) => {
          console.log(address)
          checkDeployShouldFail(browser, () => {
            checkDeployShouldSucceed(browser, address, () => {
              callback(null, browser)
            })
          })
        })
}

function checkDeployShouldFail (browser, callback) {
  let config
  browser.switchFile('browser/test.json')
        .getEditorValue((content) => {
          config = JSON.parse(content)
          config.deploy['VM:-'].autoDeployLib = false
        })
        .perform(() => {
          browser.setEditorValue(JSON.stringify(config))
        })
        .switchFile('browser/Untitled5.sol')
        .selectContract('test') // deploy lib
        .createContract('')
        .assert.containsText('div[class^="terminal"]', '<address> is not a valid address')
        .perform(() => { callback() })
}

function checkDeployShouldSucceed (browser, address, callback) {
  let addressRef
  let config
  browser.switchFile('browser/test.json')
        .getEditorValue((content) => {
          config = JSON.parse(content)
          config.deploy['VM:-'].autoDeployLib = false
          config.deploy['VM:-']['linkReferences']['browser/Untitled5.sol'].lib = address
        })
        .perform(() => {
          browser.setEditorValue(JSON.stringify(config))
        })
        .switchFile('browser/Untitled5.sol')
        .selectContract('test') // deploy lib
        .createContract('')
        .getAddressAtPosition(1, (address) => {
          addressRef = address
        })
        .waitForElementPresent('.instance:nth-of-type(3)')
        .click('.instance:nth-of-type(3) > div > button')
        .perform(() => {
          browser
            .testConstantFunction(addressRef, 'get - call', '', '0: uint256: 45')
            .perform(() => { callback() })
        })
}

function testSignature (browser, callback) {
  let hash, signature
  browser.signMessage('test message', (h, s) => {
    hash = h
    signature = s
    browser.assert.ok(typeof hash.value === 'string', 'type of hash.value must be String')
    browser.assert.ok(typeof signature.value === 'string', 'type of signature.value must be String')
  })
      .addFile('signMassage.sol', sources[6]['browser/signMassage.sol'])
      .switchFile('browser/signMassage.sol')
      .selectContract('ECVerify')
      .createContract('')
      .waitForElementPresent('.instance:nth-of-type(4)')
      .click('.instance:nth-of-type(4) > div > button')
      .getAttribute('.instance:nth-of-type(4)', 'id', (result) => {
        // skip 'instance' part of e.g. 'instance0x692a70d2e424a56d2c6c27aa97d1a86395877b3a'
        const address = result.value.slice('instance'.length)
        browser.clickFunction('ecrecovery - call', {types: 'bytes32 hash, bytes sig', values: `"${hash.value}","${signature.value}"`})
            .verifyCallReturnValue(
              address,
              ['0: address: 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c'])
            .perform(() => {
              callback(null, browser)
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
  },
  {
    'browser/signMassage.sol': {content: `
    contract SignMassageTest {
      function testRecovery(bytes32 h, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
          return ecrecover(h, v, r, s);
      }
    }

    library ECVerify {
      function ecrecovery(bytes32 hash, bytes memory sig) public pure returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        if (sig.length != 65) {
          return address(0);
        }

        assembly {
          r := mload(add(sig, 32))
          s := mload(add(sig, 64))
          v := and(mload(add(sig, 65)), 255)
        }

        if (v < 27) {
          v += 27;
        }

        if (v != 27 && v != 28) {
          return address(0);
        }

        return ecrecover(hash, v, r, s);
      }

      function ecverify(bytes32 hash, bytes memory sig, address signer) public pure returns (bool) {
        return signer == ecrecovery(hash, sig);
      }
    }`}
  }
]
