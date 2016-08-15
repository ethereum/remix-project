'use strict'
var sourceMapping = require('./resources/sourceMapping')
var index = require('../src/index')
var tape = require('tape')

tape('Util', function (t) {
  var testSourceMapping = {}
  t.test('sourceMappingDecoder', function (st) {
    st.plan(28)
    var sourceMappingDecoder = new index.util.SourceMappingDecoder()
    console.log('test decompressAll')
    var result = sourceMappingDecoder.decompressAll(sourceMapping.mapping)
    st.ok(result[0].start === 0)
    st.ok(result[0].length === 205)
    st.ok(result[0].file === 4)
    st.ok(result[0].jump === '-')

    st.ok(result[21].start === 0)
    st.ok(result[21].length === 205)
    st.ok(result[21].file === 4)
    st.ok(result[21].jump === '-')
    testSourceMapping[21] = result[21]

    st.ok(result[22].start === 55)
    st.ok(result[22].length === 74)
    st.ok(result[22].file === 4)
    st.ok(result[22].jump === '-')

    var last = result.length - 1
    st.ok(result[last].start === 142)
    st.ok(result[last].length === 61)
    st.ok(result[last].file === 4)
    st.ok(result[last].jump === 'o')
    testSourceMapping['last'] = result[last]

    console.log('test decompress')
    result = sourceMappingDecoder.atIndex(22, sourceMapping.mapping)
    console.log(result)
    st.ok(result.start === 55)
    st.ok(result.length === 74)
    st.ok(result.file === 4)
    st.ok(result.jump === '-')
    testSourceMapping[22] = result

    result = sourceMappingDecoder.atIndex(82, sourceMapping.mapping)
    console.log(result)
    st.ok(result.start === 103)
    st.ok(result.length === 2)
    st.ok(result.file === 4)
    st.ok(result.jump === '-')
    testSourceMapping[82] = result

    result = sourceMappingDecoder.atIndex(85, sourceMapping.mapping)
    console.log(result)
    st.ok(result.start === 99)
    st.ok(result.length === 6)
    st.ok(result.file === 4)
    st.ok(result.jump === '-')
    testSourceMapping[85] = result
  })

  t.test('sourceMappingLineColumnConverter', function (st) {
    st.plan(10)
    var sourceMappingDecoder = new index.util.SourceMappingDecoder()
    var linesbreak = sourceMappingDecoder.getLinebreakPositions(sourceMapping.source)
    st.ok(linesbreak[0] === 16)
    st.ok(linesbreak[5] === 84)
    var result = sourceMappingDecoder.convertOffsetToLineColumn(testSourceMapping[21], linesbreak)
    st.ok(result.start.line === 0)
    st.ok(result.start.column === 0)
    st.ok(result.end.line === 15)
    st.ok(result.end.column === 1)
    result = sourceMappingDecoder.convertOffsetToLineColumn(testSourceMapping[82], linesbreak)
    st.ok(result.start.line === 7)
    st.ok(result.start.column === 12)
    st.ok(result.end.line === 7)
    st.ok(result.end.column === 14)
  })
})
