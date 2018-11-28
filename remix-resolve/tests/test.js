const rr = require('../src/index.js')
const assert = require('assert')
const fs = require('fs')
const solc = require('solc')
const Compiler = require('remix-solidity').Compiler
const async = require('async')
const Promise = require('promise')
const sleep = require('sleep')

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
        sources['github_import.sol'] = { 'content': content }
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
        'github_import.sol': { content: 'pragma solidity ^0.5.0;\nimport \'SafeMath.sol\';\n\ncontract SimpleMath {\n    using SafeMath for uint;\n}\n' }})
      })
    })
  })

  // Test successful compile after combineSource
  describe('test example_1 for successful compile', function() {
    let filename = '../remix-resolve/tests/example_1/greeter.sol'
    let tests = [], results = {}

    before(function (done) {
      const content = fs.readFileSync(filename).toString()
      let sources = []
      sources['greeter.sol'] = { 'content': content }
      rr.combineSource('../remix-resolve/tests/example_1/', sources)
        .then(sources => {
          const outputSelection = {
              // Enable the metadata and bytecode outputs of every single contract.
              '*': {
                  '': ['legacyAST'],
                  '*': ['abi', 'evm.bytecode.object', 'devdoc', 'userdoc', 'evm.gasEstimates']
              }
          }
          const settings = {
              optimizer: { enabled: true, runs: 500 },
              evmVersion: 'byzantium',
              outputSelection
          }
          const input = { language: 'Solidity', sources, settings }
          results = solc.compile(JSON.stringify(input))
          done()
        })
        .catch(e => {
          throw e
        })
    })
    it('should match compiled json', function () {
      assert.deepEqual(results, `{"contracts":{"greeter.sol":{"Greeter":{"abi":[{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"greet","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"mortal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_greeting","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}],"devdoc":{"methods":{}},"evm":{"bytecode":{"linkReferences":{},"object":"608060405234801561001057600080fd5b506040516103733803806103738339810180604052602081101561003357600080fd5b81019080805164010000000081111561004b57600080fd5b8201602081018481111561005e57600080fd5b815164010000000081118282018710171561007857600080fd5b505080519093506100929250600191506020840190610099565b5050610134565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100da57805160ff1916838001178555610107565b82800160010185558215610107579182015b828111156101075782518255916020019190600101906100ec565b50610113929150610117565b5090565b61013191905b80821115610113576000815560010161011d565b90565b610230806101436000396000f3fe6080604052600436106100565763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166341c0e1b5811461005b578063cfae321714610072578063f1eae25c146100fc575b600080fd5b34801561006757600080fd5b50610070610111565b005b34801561007e57600080fd5b5061008761014e565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100c15781810151838201526020016100a9565b50505050905090810190601f1680156100ee5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561010857600080fd5b506100706101e3565b60005473ffffffffffffffffffffffffffffffffffffffff1633141561014c5760005473ffffffffffffffffffffffffffffffffffffffff16ff5b565b60018054604080516020601f600260001961010087891615020190951694909404938401819004810282018101909252828152606093909290918301828280156101d95780601f106101ae576101008083540402835291602001916101d9565b820191906000526020600020905b8154815290600101906020018083116101bc57829003601f168201915b5050505050905090565b6000805473ffffffffffffffffffffffffffffffffffffffff19163317905556fea165627a7a72305820302b121207c089c266b6ff1a5d282ee6cdcc92dbecd4beca1f3c49332bc2de640029","opcodes":"PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x40 MLOAD PUSH2 0x373 CODESIZE SUB DUP1 PUSH2 0x373 DUP4 CODECOPY DUP2 ADD DUP1 PUSH1 0x40 MSTORE PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x33 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 MLOAD PUSH5 0x100000000 DUP2 GT ISZERO PUSH2 0x4B JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP3 ADD PUSH1 0x20 DUP2 ADD DUP5 DUP2 GT ISZERO PUSH2 0x5E JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 MLOAD PUSH5 0x100000000 DUP2 GT DUP3 DUP3 ADD DUP8 LT OR ISZERO PUSH2 0x78 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP POP DUP1 MLOAD SWAP1 SWAP4 POP PUSH2 0x92 SWAP3 POP PUSH1 0x1 SWAP2 POP PUSH1 0x20 DUP5 ADD SWAP1 PUSH2 0x99 JUMP JUMPDEST POP POP PUSH2 0x134 JUMP JUMPDEST DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x1F ADD PUSH1 0x20 SWAP1 DIV DUP2 ADD SWAP3 DUP3 PUSH1 0x1F LT PUSH2 0xDA JUMPI DUP1 MLOAD PUSH1 0xFF NOT AND DUP4 DUP1 ADD OR DUP6 SSTORE PUSH2 0x107 JUMP JUMPDEST DUP3 DUP1 ADD PUSH1 0x1 ADD DUP6 SSTORE DUP3 ISZERO PUSH2 0x107 JUMPI SWAP2 DUP3 ADD JUMPDEST DUP3 DUP2 GT ISZERO PUSH2 0x107 JUMPI DUP3 MLOAD DUP3 SSTORE SWAP2 PUSH1 0x20 ADD SWAP2 SWAP1 PUSH1 0x1 ADD SWAP1 PUSH2 0xEC JUMP JUMPDEST POP PUSH2 0x113 SWAP3 SWAP2 POP PUSH2 0x117 JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST PUSH2 0x131 SWAP2 SWAP1 JUMPDEST DUP1 DUP3 GT ISZERO PUSH2 0x113 JUMPI PUSH1 0x0 DUP2 SSTORE PUSH1 0x1 ADD PUSH2 0x11D JUMP JUMPDEST SWAP1 JUMP JUMPDEST PUSH2 0x230 DUP1 PUSH2 0x143 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH2 0x56 JUMPI PUSH4 0xFFFFFFFF PUSH29 0x100000000000000000000000000000000000000000000000000000000 PUSH1 0x0 CALLDATALOAD DIV AND PUSH4 0x41C0E1B5 DUP2 EQ PUSH2 0x5B JUMPI DUP1 PUSH4 0xCFAE3217 EQ PUSH2 0x72 JUMPI DUP1 PUSH4 0xF1EAE25C EQ PUSH2 0xFC JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x67 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x70 PUSH2 0x111 JUMP JUMPDEST STOP JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x7E JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x87 PUSH2 0x14E JUMP JUMPDEST PUSH1 0x40 DUP1 MLOAD PUSH1 0x20 DUP1 DUP3 MSTORE DUP4 MLOAD DUP2 DUP4 ADD MSTORE DUP4 MLOAD SWAP2 SWAP3 DUP4 SWAP3 SWAP1 DUP4 ADD SWAP2 DUP6 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0xC1 JUMPI DUP2 DUP2 ADD MLOAD DUP4 DUP3 ADD MSTORE PUSH1 0x20 ADD PUSH2 0xA9 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0xEE JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x108 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x70 PUSH2 0x1E3 JUMP JUMPDEST PUSH1 0x0 SLOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND CALLER EQ ISZERO PUSH2 0x14C JUMPI PUSH1 0x0 SLOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SELFDESTRUCT JUMPDEST JUMP JUMPDEST PUSH1 0x1 DUP1 SLOAD PUSH1 0x40 DUP1 MLOAD PUSH1 0x20 PUSH1 0x1F PUSH1 0x2 PUSH1 0x0 NOT PUSH2 0x100 DUP8 DUP10 AND ISZERO MUL ADD SWAP1 SWAP6 AND SWAP5 SWAP1 SWAP5 DIV SWAP4 DUP5 ADD DUP2 SWAP1 DIV DUP2 MUL DUP3 ADD DUP2 ADD SWAP1 SWAP3 MSTORE DUP3 DUP2 MSTORE PUSH1 0x60 SWAP4 SWAP1 SWAP3 SWAP1 SWAP2 DUP4 ADD DUP3 DUP3 DUP1 ISZERO PUSH2 0x1D9 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x1AE JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x1D9 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x1BC JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 DUP1 SLOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND CALLER OR SWAP1 SSTORE JUMP INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 ADDRESS 0x2b SLT SLT SMOD 0xc0 DUP10 0xc2 PUSH7 0xB6FF1A5D282EE6 0xcd 0xcc SWAP3 0xdb 0xec 0xd4 0xbe 0xca 0x1f EXTCODECOPY 0x49 CALLER 0x2b 0xc2 0xde PUSH5 0x29000000 ","sourceMap":"46:357:0:-;;;205:81;8:9:-1;5:2;;;30:1;27;20:12;5:2;205:81:0;;;;;;;;;;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;205:81:0;;;;;;19:11:-1;14:3;11:20;8:2;;;44:1;41;34:12;8:2;62:21;;123:4;114:14;;138:31;;;135:2;;;182:1;179;172:12;135:2;213:10;;261:11;244:29;;285:43;;;282:58;-1:-1;233:115;230:2;;;361:1;358;351:12;230:2;-1:-1;;259:20:0;;205:81;;-1:-1:-1;259:20:0;;-1:-1:-1;259:8:0;;-1:-1:-1;259:20:0;;;;;:::i;:::-;;205:81;46:357;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;46:357:0;;;-1:-1:-1;46:357:0;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;"},"gasEstimates":{"creation":{"codeDepositCost":"112000","executionCost":"infinite","totalCost":"infinite"},"external":{"greet()":"infinite","kill()":"30560","mortal()":"20397"}}},"userdoc":{"methods":{}}}},"mortal.sol":{"Mortal":{"abi":[{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"mortal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}],"devdoc":{"methods":{}},"evm":{"bytecode":{"linkReferences":{},"object":"608060405234801561001057600080fd5b5060fc8061001f6000396000f3fe60806040526004361060485763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166341c0e1b58114604d578063f1eae25c146061575b600080fd5b348015605857600080fd5b50605f6073565b005b348015606c57600080fd5b50605f60af565b60005473ffffffffffffffffffffffffffffffffffffffff1633141560ad5760005473ffffffffffffffffffffffffffffffffffffffff16ff5b565b6000805473ffffffffffffffffffffffffffffffffffffffff19163317905556fea165627a7a723058203403979ec65509fedd999f7464440863faa25a2acaabd8dc0d01fa3aaeaee4400029","opcodes":"PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0xFC DUP1 PUSH2 0x1F PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH1 0x48 JUMPI PUSH4 0xFFFFFFFF PUSH29 0x100000000000000000000000000000000000000000000000000000000 PUSH1 0x0 CALLDATALOAD DIV AND PUSH4 0x41C0E1B5 DUP2 EQ PUSH1 0x4D JUMPI DUP1 PUSH4 0xF1EAE25C EQ PUSH1 0x61 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH1 0x58 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x5F PUSH1 0x73 JUMP JUMPDEST STOP JUMPDEST CALLVALUE DUP1 ISZERO PUSH1 0x6C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x5F PUSH1 0xAF JUMP JUMPDEST PUSH1 0x0 SLOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND CALLER EQ ISZERO PUSH1 0xAD JUMPI PUSH1 0x0 SLOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SELFDESTRUCT JUMPDEST JUMP JUMPDEST PUSH1 0x0 DUP1 SLOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF NOT AND CALLER OR SWAP1 SSTORE JUMP INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 CALLVALUE SUB SWAP8 SWAP15 0xc6 SSTORE MULMOD INVALID 0xdd SWAP10 SWAP16 PUSH21 0x64440863FAA25A2ACAABD8DC0D01FA3AAEAEE44000 0x29 ","sourceMap":"25:375:1:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;25:375:1;;;;;;;"},"gasEstimates":{"creation":{"codeDepositCost":"50400","executionCost":"99","totalCost":"50499"},"external":{"kill()":"30560","mortal()":"20375"}}},"userdoc":{"methods":{}}}}},"sources":{"greeter.sol":{"id":0,"legacyAST":{"attributes":{"absolutePath":"greeter.sol","exportedSymbols":{"Greeter":[25]}},"children":[{"attributes":{"literals":["solidity","^","0.5",".0"]},"id":1,"name":"PragmaDirective","src":"0:23:0"},{"attributes":{"SourceUnit":53,"absolutePath":"mortal.sol","file":"mortal.sol","scope":26,"symbolAliases":[null],"unitAlias":""},"id":2,"name":"ImportDirective","src":"24:20:0"},{"attributes":{"contractDependencies":[52],"contractKind":"contract","documentation":null,"fullyImplemented":true,"linearizedBaseContracts":[25,52],"name":"Greeter","scope":26},"children":[{"attributes":{"arguments":null},"children":[{"attributes":{"contractScope":null,"name":"Mortal","referencedDeclaration":52,"type":"contract Mortal"},"id":3,"name":"UserDefinedTypeName","src":"66:6:0"}],"id":4,"name":"InheritanceSpecifier","src":"66:6:0"},{"attributes":{"constant":false,"name":"greeting","scope":25,"stateVariable":true,"storageLocation":"default","type":"string","value":null,"visibility":"internal"},"children":[{"attributes":{"name":"string","type":"string"},"id":5,"name":"ElementaryTypeName","src":"133:6:0"}],"id":6,"name":"VariableDeclaration","src":"133:15:0"},{"attributes":{"documentation":null,"implemented":true,"isConstructor":true,"kind":"constructor","modifiers":[null],"name":"","scope":25,"stateMutability":"nonpayable","superFunction":null,"visibility":"public"},"children":[{"children":[{"attributes":{"constant":false,"name":"_greeting","scope":16,"stateVariable":false,"storageLocation":"memory","type":"string","value":null,"visibility":"internal"},"children":[{"attributes":{"name":"string","type":"string"},"id":7,"name":"ElementaryTypeName","src":"217:6:0"}],"id":8,"name":"VariableDeclaration","src":"217:23:0"}],"id":9,"name":"ParameterList","src":"216:25:0"},{"attributes":{"parameters":[null]},"children":[],"id":10,"name":"ParameterList","src":"249:0:0"},{"children":[{"children":[{"attributes":{"argumentTypes":null,"isConstant":false,"isLValue":false,"isPure":false,"lValueRequested":false,"operator":"=","type":"string storage ref"},"children":[{"attributes":{"argumentTypes":null,"overloadedDeclarations":[null],"referencedDeclaration":6,"type":"string storage ref","value":"greeting"},"id":11,"name":"Identifier","src":"259:8:0"},{"attributes":{"argumentTypes":null,"overloadedDeclarations":[null],"referencedDeclaration":8,"type":"string memory","value":"_greeting"},"id":12,"name":"Identifier","src":"270:9:0"}],"id":13,"name":"Assignment","src":"259:20:0"}],"id":14,"name":"ExpressionStatement","src":"259:20:0"}],"id":15,"name":"Block","src":"249:37:0"}],"id":16,"name":"FunctionDefinition","src":"205:81:0"},{"attributes":{"documentation":null,"implemented":true,"isConstructor":false,"kind":"function","modifiers":[null],"name":"greet","scope":25,"stateMutability":"view","superFunction":null,"visibility":"public"},"children":[{"attributes":{"parameters":[null]},"children":[],"id":17,"name":"ParameterList","src":"330:2:0"},{"children":[{"attributes":{"constant":false,"name":"","scope":24,"stateVariable":false,"storageLocation":"memory","type":"string","value":null,"visibility":"internal"},"children":[{"attributes":{"name":"string","type":"string"},"id":18,"name":"ElementaryTypeName","src":"354:6:0"}],"id":19,"name":"VariableDeclaration","src":"354:13:0"}],"id":20,"name":"ParameterList","src":"353:15:0"},{"children":[{"attributes":{"functionReturnParameters":20},"children":[{"attributes":{"argumentTypes":null,"overloadedDeclarations":[null],"referencedDeclaration":6,"type":"string storage ref","value":"greeting"},"id":21,"name":"Identifier","src":"386:8:0"}],"id":22,"name":"Return","src":"379:15:0"}],"id":23,"name":"Block","src":"369:32:0"}],"id":24,"name":"FunctionDefinition","src":"316:85:0"}],"id":25,"name":"ContractDefinition","src":"46:357:0"}],"id":26,"name":"SourceUnit","src":"0:404:0"}},"mortal.sol":{"id":1,"legacyAST":{"attributes":{"absolutePath":"mortal.sol","exportedSymbols":{"Mortal":[52]}},"children":[{"attributes":{"literals":["solidity","^","0.5",".0"]},"id":27,"name":"PragmaDirective","src":"0:23:1"},{"attributes":{"baseContracts":[null],"contractDependencies":[null],"contractKind":"contract","documentation":null,"fullyImplemented":true,"linearizedBaseContracts":[52],"name":"Mortal","scope":53},"children":[{"attributes":{"constant":false,"name":"owner","scope":52,"stateVariable":true,"storageLocation":"default","type":"address payable","value":null,"visibility":"internal"},"children":[{"attributes":{"name":"address","stateMutability":"payable","type":"address payable"},"id":28,"name":"ElementaryTypeName","src":"99:15:1"}],"id":29,"name":"VariableDeclaration","src":"99:21:1"},{"attributes":{"documentation":null,"implemented":true,"isConstructor":false,"kind":"function","modifiers":[null],"name":"mortal","scope":52,"stateMutability":"nonpayable","superFunction":null,"visibility":"public"},"children":[{"attributes":{"parameters":[null]},"children":[],"id":30,"name":"ParameterList","src":"231:2:1"},{"attributes":{"parameters":[null]},"children":[],"id":31,"name":"ParameterList","src":"241:0:1"},{"children":[{"children":[{"attributes":{"argumentTypes":null,"isConstant":false,"isLValue":false,"isPure":false,"lValueRequested":false,"operator":"=","type":"address payable"},"children":[{"attributes":{"argumentTypes":null,"overloadedDeclarations":[null],"referencedDeclaration":29,"type":"address payable","value":"owner"},"id":32,"name":"Identifier","src":"243:5:1"},{"attributes":{"argumentTypes":null,"isConstant":false,"isLValue":false,"isPure":false,"lValueRequested":false,"member_name":"sender","referencedDeclaration":null,"type":"address payable"},"children":[{"attributes":{"argumentTypes":null,"overloadedDeclarations":[null],"referencedDeclaration":67,"type":"msg","value":"msg"},"id":33,"name":"Identifier","src":"251:3:1"}],"id":34,"name":"MemberAccess","src":"251:10:1"}],"id":35,"name":"Assignment","src":"243:18:1"}],"id":36,"name":"ExpressionStatement","src":"243:18:1"}],"id":37,"name":"Block","src":"241:23:1"}],"id":38,"name":"FunctionDefinition","src":"216:48:1"},{"attributes":{"documentation":null,"implemented":true,"isConstructor":false,"kind":"function","modifiers":[null],"name":"kill","scope":52,"stateMutability":"nonpayable","superFunction":null,"visibility":"public"},"children":[{"attributes":{"parameters":[null]},"children":[],"id":39,"name":"ParameterList","src":"339:2:1"},{"attributes":{"parameters":[null]},"children":[],"id":40,"name":"ParameterList","src":"349:0:1"},{"children":[{"attributes":{"falseBody":null},"children":[{"attributes":{"argumentTypes":null,"commonType":{"typeIdentifier":"t_address_payable","typeString":"address payable"},"isConstant":false,"isLValue":false,"isPure":false,"lValueRequested":false,"operator":"==","type":"bool"},"children":[{"attributes":{"argumentTypes":null,"isConstant":false,"isLValue":false,"isPure":false,"lValueRequested":false,"member_name":"sender","referencedDeclaration":null,"type":"address payable"},"children":[{"attributes":{"argumentTypes":null,"overloadedDeclarations":[null],"referencedDeclaration":67,"type":"msg","value":"msg"},"id":41,"name":"Identifier","src":"355:3:1"}],"id":42,"name":"MemberAccess","src":"355:10:1"},{"attributes":{"argumentTypes":null,"overloadedDeclarations":[null],"referencedDeclaration":29,"type":"address payable","value":"owner"},"id":43,"name":"Identifier","src":"369:5:1"}],"id":44,"name":"BinaryOperation","src":"355:19:1"},{"children":[{"attributes":{"argumentTypes":null,"isConstant":false,"isLValue":false,"isPure":false,"isStructConstructorCall":false,"lValueRequested":false,"names":[null],"type":"tuple()","type_conversion":false},"children":[{"attributes":{"argumentTypes":[{"typeIdentifier":"t_address_payable","typeString":"address payable"}],"overloadedDeclarations":[null],"referencedDeclaration":75,"type":"function (address payable)","value":"selfdestruct"},"id":45,"name":"Identifier","src":"376:12:1"},{"attributes":{"argumentTypes":null,"overloadedDeclarations":[null],"referencedDeclaration":29,"type":"address payable","value":"owner"},"id":46,"name":"Identifier","src":"389:5:1"}],"id":47,"name":"FunctionCall","src":"376:19:1"}],"id":48,"name":"ExpressionStatement","src":"376:19:1"}],"id":49,"name":"IfStatement","src":"351:44:1"}],"id":50,"name":"Block","src":"349:49:1"}],"id":51,"name":"FunctionDefinition","src":"326:72:1"}],"id":52,"name":"ContractDefinition","src":"25:375:1"}],"id":53,"name":"SourceUnit","src":"0:401:1"}}}}`)
    })
  })

  // Test github imports with callback
  describe('test github imports with callback', function() {
    let sources = {}, results = {}
    sources = {
      'github_import.sol': { content: 'pragma solidity ^0.5.0;\nimport \'https://github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol\';\n\ncontract SimpleMath {\n    using SafeMath for uint;\n}\n' }
    }

    before(function (done) {
      const findImportsSync = function (path) {
        rr.resolve('./', path).then(function(result) {
          return result
        }).catch(function(e) {
          throw e
        })
        return {}
      }
      const outputSelection = {
          // Enable the metadata and bytecode outputs of every single contract.
          '*': {
              '': ['ast', 'legacyAST'],
              '*': ['abi', 'evm.bytecode.object', 'devdoc', 'userdoc', 'evm.gasEstimates']
          }
      }
      const settings = {
          optimizer: { enabled: true, runs: 500 },
          evmVersion: 'byzantium',
          outputSelection
      }
      const input = { language: 'Solidity', sources, settings }
      results = solc.compile(JSON.stringify(input), findImportsSync)
      done()
    })
    it('should not match file not found error msg', function () {
      const msg = "{\"contracts\":{},\"errors\":[{\"component\":\"general\",\"formattedMessage\":\"github_import.sol:2:1: ParserError: Source \\\"https://github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol\\\" not found: File not found.\\nimport 'https://github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol';\\n^-------------------------------------------------------------------------------------^\\n\",\"message\":\"Source \\\"https://github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol\\\" not found: File not found.\",\"severity\":\"error\",\"sourceLocation\":{\"end\":111,\"file\":\"github_import.sol\",\"start\":24},\"type\":\"ParserError\"}],\"sources\":{}}"
      assert.notDeepStrictEqual(results, msg)
    })
  })
})
