'use strict'
var tape = require('tape')
var SourceMappingDecoder = require('../src/util/sourceMappingDecoder')
var compiler = require('solc')
var helpers = require('./helpers.js')

tape('SourceMappingDecoder', function (t) {
  t.test('SourceMappingDecoder.findNodeAtInstructionIndex', function (st) {
    var output = compiler.compileStandardWrapper(helpers.compilerInput(contracts))
    output = JSON.parse(output)
    var sourceMappingDecoder = new SourceMappingDecoder()
    var node = sourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', 2, output.contracts['test.sol']['test'].evm.deployedBytecode.sourceMap, output.sources['test.sol'])
    st.equal(node, null)
    node = sourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', 80, output.contracts['test.sol']['test'].evm.deployedBytecode.sourceMap, output.sources['test.sol'])
    st.notEqual(node, null)
    if (node) {
      st.equal(node.attributes.name, 'f1')
    }
    st.end()
  })
})

var contracts = `contract test {
    function f1() returns (uint) {
        uint t = 4;
        return t;
    }
    
    function f2() {
        
    }
}
`
