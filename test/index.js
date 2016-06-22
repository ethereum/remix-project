'use strict'
var tape = require('tape')
var init = require('../src/helpers/init')
tape('index', function (t) {
  t.test('loadContext - web3', function (st) {
    var context = init.loadContext()
    st.notEqual(context.web3, undefined)
    st.notEqual(context.web3, null)
    st.end()
  })
})
