'use strict'
const tape = require('tape')
const util = require('../src/util')

tape('Util', function (t) {
  t.test('lowerbound', function (st) {
    st.plan(7)
    let array = [2, 5, 8, 9, 45, 56, 78]
    let lowerBound = util.findLowerBound(10, array)
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

  const result = util.groupBy([
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

tape('util.concatWithSeperator valid output', function (t) {
  t.plan(4)
  t.notEqual(util.concatWithSeperator(['a', 'b', 'c'], ','), 'a, b, c', 'Concat with comma should not produce spaces')
  t.equal(util.concatWithSeperator(['a', 'b', 'c'], ','), 'a,b,c', 'Concat with comma should not produce spaces')
  t.equal(util.concatWithSeperator(['a', 'b', 'c'], ', '), 'a, b, c', 'Concat with comma space should not produce trailing comma')
  t.equal(util.concatWithSeperator(['a', 'b', 'c'], '+'), 'a+b+c', 'Concat with plus')
})

tape('util.escapeRegExp', function (t) {
  t.plan(3)
  const original = 'function (uint256) returns (bool)'
  t.equal(util.escapeRegExp('abcd'), 'abcd', 'String with no regex')
  t.equal(util.escapeRegExp(original), 'function \\(uint256\\) returns \\(bool\\)', 'function string with regex')
  t.ok(new RegExp(util.escapeRegExp(original)).test(original), 'should still test for original string')
})

tape('util.compareByteCode', function (t) {
  t.plan(1)
  const address = 'c2a9cef5420203c2672f0e4325cca774893cca98'
  const nullAddress = '0000000000000000000000000000000000000000'
  const deployedLibraryByteCode = '0x73c2a9cef5420203c2672f0e4325cca774893cca983014608060405260043610610058576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063f26ea02c1461005d575b600080fd5b81801561006957600080fd5b506100886004803603810190808035906020019092919050505061008a565b005b600081600101600060648110151561009e57fe5b600502016002018190555060008160010160006064811015156100bd57fe5b600502016004018190555060008160010160006064811015156100dc57fe5b6005020160030181905550600081600001819055506001816101f501819055816101f601819055506064816101f70181905550505600a165627a7a723058203a6f106db7413fd9cad962bc12ba2327799d6b1334335f7bb854eab04200b3bf0029'
  t.ok(util.compareByteCode(deployedLibraryByteCode, deployedLibraryByteCode.replace(address, nullAddress)), 'library bytecode should be the same')
})

