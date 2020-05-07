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
