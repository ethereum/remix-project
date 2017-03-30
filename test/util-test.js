var test = require('tape')

var utils = require('../src/app/utils')

test('util.groupBy on valid input', function (t) {
  t.plan(1)

  var result = utils.groupBy([
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

test('util.concatWithSeperator valid output', function (t) {
  t.plan(4)
  t.notEqual(utils.concatWithSeperator(['a', 'b', 'c'], ','), 'a, b, c', 'Concat with comma should not produce spaces')
  t.equal(utils.concatWithSeperator(['a', 'b', 'c'], ','), 'a,b,c', 'Concat with comma should not produce spaces')
  t.equal(utils.concatWithSeperator(['a', 'b', 'c'], ', '), 'a, b, c', 'Concat with comma space should not produce trailing comma')
  t.equal(utils.concatWithSeperator(['a', 'b', 'c'], '+'), 'a+b+c', 'Concat with plus')
})

test('util.escapeRegExp', function (t) {
  t.plan(3)
  var original = 'function (uint256) returns (bool)'
  t.equal(utils.escapeRegExp('abcd'), 'abcd', 'String with no regex')
  t.equal(utils.escapeRegExp(original), 'function \\(uint256\\) returns \\(bool\\)', 'function string with regex')
  t.ok(new RegExp(utils.escapeRegExp(original)).test(original), 'should still test for original string')
})
