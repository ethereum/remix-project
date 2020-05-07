'use strict'
import { default as test} from "tape"
import { concatWithSeperator, escapeRegExp, groupBy } from '../../src/util/helpers'

test('util.concatWithSeperator valid output', function (t) {
  t.plan(4)
  t.notEqual(concatWithSeperator(['a', 'b', 'c'], ','), 'a, b, c', 'Concat with comma should not produce spaces')
  t.equal(concatWithSeperator(['a', 'b', 'c'], ','), 'a,b,c', 'Concat with comma should not produce spaces')
  t.equal(concatWithSeperator(['a', 'b', 'c'], ', '), 'a, b, c', 'Concat with comma space should not produce trailing comma')
  t.equal(concatWithSeperator(['a', 'b', 'c'], '+'), 'a+b+c', 'Concat with plus')
})

test('util.escapeRegExp', function (t) {
  t.plan(3)
  const original = 'function (uint256) returns (bool)'
  t.equal(escapeRegExp('abcd'), 'abcd', 'String with no regex')
  t.equal(escapeRegExp(original), 'function \\(uint256\\) returns \\(bool\\)', 'function string with regex')
  t.ok(new RegExp(escapeRegExp(original)).test(original), 'should still test for original string')
})

test('util.groupBy on valid input', function (t) {
  t.plan(1)

  const result = groupBy([
    {category: 'GAS', name: 'a'},
    {category: 'SEC', name: 'b'},
    {category: 'GAS', name: 'c'}

  ], 'category')

  const expectedResult = {
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

