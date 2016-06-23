'use strict'
var tape = require('tape')
var init = require('../src/helpers/init')
tape('index', function (t) {
  t.test('loadContext - web3', function (st) {
    var web3 = init.loadWeb3()
    st.notEqual(web3, undefined)
    st.notEqual(web3, null)
    st.end()
  })
})
