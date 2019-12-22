'use strict'
const tape = require('tape')
const sourceMapping = require('./resources/sourceMapping')
const SourceMappingDecoder = require('../src/sourceMappingDecoder')
const compiler = require('solc')
const compilerInput = require('../src/helpers/compilerHelper').compilerInput

tape('SourceMappingDecoder', function (t) {
  t.test('SourceMappingDecoder.findNodeAtInstructionIndex', function (st) {
    let output = compiler.compile(compilerInput(contracts))
    output = JSON.parse(output)
    const sourceMappingDecoder = new SourceMappingDecoder()
    let node = sourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', 2, output.contracts['test.sol']['test'].evm.deployedBytecode.sourceMap, output.sources['test.sol'])
    st.equal(node, null)
    node = sourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', 80, output.contracts['test.sol']['test'].evm.deployedBytecode.sourceMap, output.sources['test.sol'])
    st.notEqual(node, null)
    if (node) {
      st.equal(node.attributes.name, 'f1')
    }
    st.end()
  })

  const testSourceMapping = {}
  t.test('sourceMappingDecoder', function (st) {
    st.plan(28)
    const sourceMappingDecoder = new SourceMappingDecoder()
    console.log('test decompressAll')
    let result = sourceMappingDecoder.decompressAll(sourceMapping.mapping)
    st.equal(result[0].start, 0)
    st.equal(result[0].length, 205)
    st.equal(result[0].file, 4)
    st.equal(result[0].jump, '-')

    st.equal(result[21].start, 0)
    st.equal(result[21].length, 205)
    st.equal(result[21].file, 4)
    st.equal(result[21].jump, '-')
    testSourceMapping[21] = result[21]

    st.equal(result[22].start, 55)
    st.equal(result[22].length, 74)
    st.equal(result[22].file, 4)
    st.equal(result[22].jump, '-')

    const last = result.length - 1
    st.equal(result[last].start, 142)
    st.equal(result[last].length, 61)
    st.equal(result[last].file, 4)
    st.equal(result[last].jump, 'o')
    testSourceMapping['last'] = result[last]

    console.log('test decompress')
    result = sourceMappingDecoder.atIndex(22, sourceMapping.mapping)
    console.log(result)
    st.equal(result.start, 55)
    st.equal(result.length, 74)
    st.equal(result.file, 4)
    st.equal(result.jump, '-')
    testSourceMapping[22] = result

    result = sourceMappingDecoder.atIndex(82, sourceMapping.mapping)
    console.log(result)
    st.equal(result.start, 103)
    st.equal(result.length, 2)
    st.equal(result.file, 4)
    st.equal(result.jump, '-')
    testSourceMapping[82] = result

    result = sourceMappingDecoder.atIndex(85, sourceMapping.mapping)
    console.log(result)
    st.equal(result.start, 99)
    st.equal(result.length, 6)
    st.equal(result.file, 4)
    st.equal(result.jump, '-')
    testSourceMapping[85] = result
  })

  t.test('sourceMappingLineColumnConverter', function (st) {
    st.plan(14)
    const sourceMappingDecoder = new SourceMappingDecoder()
    const linesbreak = sourceMappingDecoder.getLinebreakPositions(sourceMapping.source)
    st.equal(linesbreak[0], 16)
    st.equal(linesbreak[5], 84)
    let result = sourceMappingDecoder.convertOffsetToLineColumn(testSourceMapping[21], linesbreak)
    st.equal(result.start.line, 0)
    st.equal(result.start.column, 0)
    st.equal(result.end.line, 15)
    st.equal(result.end.column, 1)
    result = sourceMappingDecoder.convertOffsetToLineColumn(testSourceMapping[82], linesbreak)
    st.equal(result.start.line, 7)
    st.equal(result.start.column, 12)
    st.equal(result.end.line, 7)
    st.equal(result.end.column, 14)

    const res = { // point to \n
      start: 103,
      length: 4,
      file: 4,
      jump: '-'
    }
    result = sourceMappingDecoder.convertOffsetToLineColumn(res, linesbreak)
    st.equal(result.start.line, 7)
    st.equal(result.start.column, 12)
    st.equal(result.end.line, 7)
    st.equal(result.end.column, 16)
  })
})

const contracts = `contract test {
    function f1() public returns (uint) {
        uint t = 4;
        return t;
    }
    
    function f2() public {
        
    }
}
`
