'use strict'
var sourceMapping = require('./resources/sourceMapping')
var index = require('../src/index')
var tape = require('tape')
var util = require('../src/helpers/util')

tape('Util', function (t) {
  t.test('lowerbound', function (st) {
    st.plan(7)
    var array = [2, 5, 8, 9, 45, 56, 78]
    var lowerBound = util.findLowerBound(10, array)
    st.equal(lowerBound, 3)

    lowerBound = util.findLowerBound(3, array)
    st.equal(lowerBound, 0)

    lowerBound = util.findLowerBound(100, array)
    st.equal(lowerBound, 6)

    lowerBound = util.findLowerBound(1, array)
    st.equal(lowerBound, -1)

    lowerBound = util.findLowerBound(45, array)
    st.equal(lowerBound, 4)

    array = [2, 5, 8, 9, 9, 45, 56, 78]
    lowerBound = util.findLowerBound(9, array)
    st.equal(lowerBound, 4)

    lowerBound = util.findLowerBound(9, [])
    st.equal(lowerBound, -1)
  })

  var testSourceMapping = {}
  t.test('sourceMappingDecoder', function (st) {
    st.plan(28)
    var sourceMappingDecoder = new index.util.SourceMappingDecoder()
    console.log('test decompressAll')
    var result = sourceMappingDecoder.decompressAll(sourceMapping.mapping)
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

    var last = result.length - 1
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
    var sourceMappingDecoder = new index.util.SourceMappingDecoder()
    var linesbreak = sourceMappingDecoder.getLinebreakPositions(sourceMapping.source)
    st.equal(linesbreak[0], 16)
    st.equal(linesbreak[5], 84)
    var result = sourceMappingDecoder.convertOffsetToLineColumn(testSourceMapping[21], linesbreak)
    st.equal(result.start.line, 0)
    st.equal(result.start.column, 0)
    st.equal(result.end.line, 15)
    st.equal(result.end.column, 1)
    result = sourceMappingDecoder.convertOffsetToLineColumn(testSourceMapping[82], linesbreak)
    st.equal(result.start.line, 7)
    st.equal(result.start.column, 12)
    st.equal(result.end.line, 7)
    st.equal(result.end.column, 14)

    var res = { // point to \n
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
