const rr = require('../src/index.js')
const assert = require('assert')
const fs = require('fs')

describe('testRunner', function () {
  describe('#combineSource', function() {
    describe('test with beforeAll', function () {
      let filename = 'tests/examples_1/greeter.sol'
      let tests = [], results = {}

      before(function (done) {
        const content = fs.readFileSync('../remix-resolve/tests/example_1/greeter.sol').toString()
        var sources = []
        sources['greeter.sol'] = { 'content': content }
        rr.combineSource('../remix-resolve/tests/example_1/', sources)
          .then(sources => {
            results = sources
            done()
          })
          .catch(e => {
            throw e
          })
      })

      it('should 1 passing test', function () {
        assert.equal(Object.keys(results).length, 2)
      })

      it('should returns 2 contracts with content', function () {
        assert.deepEqual(results, { 'mortal.sol':{ content: 'pragma solidity ^0.5.0;\n\ncontract Mortal {\n    /* Define variable owner of the type address */\n    address payable owner;\n\n    /* This function is executed at initialization and sets the owner of the contract */\n    function mortal() public { owner = msg.sender; }\n\n    /* Function to recover the funds on the contract */\n    function kill() public { if (msg.sender == owner) selfdestruct(owner); }\n}\n' },
        'greeter.sol': { content: 'pragma solidity ^0.5.0;\nimport \'mortal.sol\';\n\ncontract Greeter is Mortal {\n    /* Define variable greeting of the type string */\n    string greeting;\n\n    /* This runs when the contract is executed */\n    constructor(string memory _greeting) public {\n        greeting = _greeting;\n    }\n\n    /* Main function */\n    function greet() public view returns (string memory) {\n        return greeting;\n    }\n}\n' }})
      })
    })
  })
})
