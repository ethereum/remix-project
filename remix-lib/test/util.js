'use strict'
var tape = require('tape')
var util = require('../src/util')

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
})

tape('util.groupBy on valid input', function (t) {
  t.plan(1)

  var result = util.groupBy([
    {category: 'GAS', name: 'a'},
    {category: 'SEC', name: 'b'},
    {category: 'GAS', name: 'c'}

  ], 'category')

  var expectedResult = {
    'GAS': [
      {category: 'GAS', name: 'a'},
      {category: 'GAS', name: 'c'}
    ],
    'SEC': [
      {category: 'SEC', name: 'b'}
    ]
  }

  t.deepEqual(result, expectedResult)
})

tape('util.concatWithSeperator valid output', function (t) {
  t.plan(4)
  t.notEqual(util.concatWithSeperator(['a', 'b', 'c'], ','), 'a, b, c', 'Concat with comma should not produce spaces')
  t.equal(util.concatWithSeperator(['a', 'b', 'c'], ','), 'a,b,c', 'Concat with comma should not produce spaces')
  t.equal(util.concatWithSeperator(['a', 'b', 'c'], ', '), 'a, b, c', 'Concat with comma space should not produce trailing comma')
  t.equal(util.concatWithSeperator(['a', 'b', 'c'], '+'), 'a+b+c', 'Concat with plus')
})

tape('util.escapeRegExp', function (t) {
  t.plan(3)
  var original = 'function (uint256) returns (bool)'
  t.equal(util.escapeRegExp('abcd'), 'abcd', 'String with no regex')
  t.equal(util.escapeRegExp(original), 'function \\(uint256\\) returns \\(bool\\)', 'function string with regex')
  t.ok(new RegExp(util.escapeRegExp(original)).test(original), 'should still test for original string')
})

