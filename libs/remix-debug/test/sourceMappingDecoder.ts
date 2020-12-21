'use strict'
const tape = require('tape')
const sourceMapping = require('./resources/sourceMapping')
import * as sourceMappingDecoder from '../src/source/sourceMappingDecoder'
const compiler = require('solc')
const compilerInput = require('./helpers/compilerHelper').compilerInput

tape('sourceMappingDecoder', function (t) {
  t.test('sourceMappingDecoder.findNodeAtInstructionIndex', function (st) {
    let output = compiler.compile(compilerInput(contracts))
    output = JSON.parse(output)
    let node = sourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', 2, output.contracts['test.sol']['test'].evm.deployedBytecode.sourceMap, output.sources['test.sol'])
    st.equal(node, null)
    node = sourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', 80, output.contracts['test.sol']['test'].evm.deployedBytecode.sourceMap, output.sources['test.sol'])
    st.notEqual(node, null)
    if (node) {
      st.equal(node.name, 'f1')
    }
    st.end()
  })

  const testSourceMapping = {}
  t.test('sourceMappingDecoder', function (st) {
    st.plan(36)
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
    const result2 = sourceMappingDecoder.atIndex(22, sourceMapping.mapping)
    // console.log(result2)
    st.equal(result2['start'], 55)
    st.equal(result2['length'], 74)
    st.equal(result2['file'], 4)
    st.equal(result2['jump'], '-')
    testSourceMapping[22] = result2

    const result3 = sourceMappingDecoder.atIndex(82, sourceMapping.mapping)
    // console.log(result)
    st.equal(result3['start'], 103)
    st.equal(result3['length'], 2)
    st.equal(result3['file'], 4)
    st.equal(result3['jump'], '-')
    testSourceMapping[82] = result3

    const result4 = sourceMappingDecoder.atIndex(85, sourceMapping.mapping)
    // console.log(result)
    st.equal(result4['start'], 99)
    st.equal(result4['length'], 6)
    st.equal(result4['file'], 4)
    st.equal(result4['jump'], '-')
    testSourceMapping[85] = result4

    // ballot - function deletegate(address)
    const delegateSrcMap = sourceMappingDecoder.atIndex(64, sourceMapping.ballotSourceMap)
    console.log(delegateSrcMap)
    st.equal(delegateSrcMap['start'], 712)
    st.equal(delegateSrcMap['length'], 577)
    st.equal(delegateSrcMap['file'], 0)
    st.equal(delegateSrcMap['jump'], '-')

    // TokenSaleChallenge - function test(uint256)
    const tokenSaleChallengeMap = sourceMappingDecoder.atIndex(170, sourceMapping.tokenSaleChallengeSourceMap)
    console.log(tokenSaleChallengeMap)
    st.equal(tokenSaleChallengeMap['start'], 45)
    st.equal(tokenSaleChallengeMap['length'], 16)
    st.equal(tokenSaleChallengeMap['file'], -1)
    st.equal(tokenSaleChallengeMap['jump'], '-')
  })

  t.test('sourceMappingLineColumnConverter', function (st) {
    st.plan(14)
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
    // case: 'file' is not yet assigned, while processing the srcmap (reverse looping) to find 'start', 'length' (etc..), we tumble on -1 for the file.
    // in that case the step has to be discarded
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
