const rr = require('../src/index.js')
const assert = require('assert')
const fs = require('fs')

describe('testRunner', function () {
  describe('#combineSource', function() {
    describe('test example_1 [local imports]]', function () {
      let filename = '../remix-resolve/tests/example_1/greeter.sol'
      let tests = [], results = {}

      before(function (done) {
        const content = fs.readFileSync(filename).toString()
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

      it('should returns 2 contracts with specified content', function () {
        assert.deepEqual(results, { 'mortal.sol':{ content: 'pragma solidity ^0.5.0;\n\ncontract Mortal {\n    /* Define variable owner of the type address */\n    address payable owner;\n\n    /* This function is executed at initialization and sets the owner of the contract */\n    function mortal() public { owner = msg.sender; }\n\n    /* Function to recover the funds on the contract */\n    function kill() public { if (msg.sender == owner) selfdestruct(owner); }\n}\n' },
        'greeter.sol': { content: 'pragma solidity ^0.5.0;\nimport \'mortal.sol\';\n\ncontract Greeter is Mortal {\n    /* Define variable greeting of the type string */\n    string greeting;\n\n    /* This runs when the contract is executed */\n    constructor(string memory _greeting) public {\n        greeting = _greeting;\n    }\n\n    /* Main function */\n    function greet() public view returns (string memory) {\n        return greeting;\n    }\n}\n' }})
      })
    })

    describe('test example_2 [github imports]', function () {
      let filename = '../remix-resolve/tests/example_2/github_import.sol'
      let tests = [], results = {}

      before(function (done) {
        const content = fs.readFileSync(filename).toString()
        var sources = []
        sources['greeter.sol'] = { 'content': content }
        rr.combineSource('../remix-resolve/tests/example_2/', sources)
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

      it('should returns 2 contracts with specified content', function () {
        assert.deepEqual(results, { 'SafeMath.sol': { content: 'pragma solidity ^0.4.24;\n\n/**\n * @title SafeMath\n * @dev Math operations with safety checks that revert on error\n */\nlibrary SafeMath {\n    /**\n    * @dev Multiplies two numbers, reverts on overflow.\n    */\n    function mul(uint256 a, uint256 b) internal pure returns (uint256) {\n        \/\/ Gas optimization: this is cheaper than requiring \'a\' not being zero, but the\n        \/\/ benefit is lost if \'b\' is also tested.\n        \/\/ See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522\n        if (a == 0) {\n            return 0;\n        }\n\n        uint256 c = a * b;\n        require(c / a == b);\n\n        return c;\n    }\n\n    /**\n    * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.\n    */\n    function div(uint256 a, uint256 b) internal pure returns (uint256) {\n        \/\/ Solidity only automatically asserts when dividing by 0\n        require(b > 0);\n        uint256 c = a / b;\n        \/\/ assert(a == b * c + a % b); \/\/ There is no case in which this doesn\'t hold\n\n        return c;\n    }\n\n    \/**\n    * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).\n    *\/\n    function sub(uint256 a, uint256 b) internal pure returns (uint256) {\n        require(b <= a);\n        uint256 c = a - b;\n\n        return c;\n    }\n\n    /**\n    * @dev Adds two numbers, reverts on overflow.\n    */\n    function add(uint256 a, uint256 b) internal pure returns (uint256) {\n        uint256 c = a + b;\n        require(c >= a);\n\n        return c;\n    }\n\n    \/**\n    * @dev Divides two numbers and returns the remainder (unsigned integer modulo),\n    * reverts when dividing by zero.\n    *\/\n    function mod(uint256 a, uint256 b) internal pure returns (uint256) {\n        require(b != 0);\n        return a % b;\n    }\n}\n' },
        'greeter.sol': { content: 'pragma solidity ^0.5.0;\nimport \'SafeMath.sol\';\n\ncontract SimpleMath {\n    using SafeMath for uint;\n}\n' }})
      })
    })
  })
})
