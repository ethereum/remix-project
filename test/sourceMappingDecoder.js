'use strict'
var tape = require('tape')
var SourceMappingDecoder = require('../src/util/sourceMappingDecoder')
var compiler = require('solc')

tape('SourceMappingDecoder', function (t) {
  t.test('SourceMappingDecoder.findNodeAtInstructionIndex', function (st) {
    var output = compiler.compile(contracts, 0)
    var sourceMappingDecoder = new SourceMappingDecoder()
    var node = sourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', 2, output.contracts[':test'].srcmapRuntime, output.sources[''])
    st.equal(node, null)
    node = sourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', 80, output.contracts[':test'].srcmapRuntime, output.sources[''])
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
