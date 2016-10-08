'use strict'

var test = require('tape')

var QueryParams = require('../src/app/query-params')

test('queryParams.get', function (t) {
  t.plan(2)

  var fakeWindow = {location: {hash: '#wat=sup&foo=bar', search: ''}}
  var params = new QueryParams(fakeWindow).get()
  t.equal(params.wat, 'sup')
  t.equal(params.foo, 'bar')
})

test('queryParams.update', function (t) {
  t.plan(1)

  var fakeWindow = {location: {hash: '#wat=sup', search: ''}}
  var qp = new QueryParams(fakeWindow)
  qp.update({foo: 'bar'})
  t.equal(fakeWindow.location.hash, '#wat=sup&foo=bar')
})
