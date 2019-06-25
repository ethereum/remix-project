'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Test Simple Contract': function (browser) {
    browser.testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['test1', 'test2'])
  },
  'Test Success Import': function (browser) {
    browser.addFile('Untitled1.sol', sources[1]['browser/Untitled1.sol'])
          .addFile('Untitled2.sol', sources[1]['browser/Untitled2.sol'])
          .switchFile('browser/Untitled1.sol')
          .verifyContracts(['test6', 'test4', 'test5'])
  },

  'Test Failed Import': function (browser) {
    browser.addFile('Untitled3.sol', sources[2]['browser/Untitled3.sol'])
          .clickLaunchIcon('solidity')
          .assert.containsText('#compileTabView .error pre', 'Unable to import "browser/Untitled11.sol": File not found')
          .end()
  },
  tearDown: sauce
}

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
  }
]
