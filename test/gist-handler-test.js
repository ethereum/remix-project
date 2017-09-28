'use strict'

var test = require('tape')

var GistHandler = require('../src/lib/gist-handler')

test('gistHandler.handleLoad with no gist param', function (t) {
  t.plan(1)

  var gistHandler = new GistHandler({})

  var params = {}
  var result = gistHandler.handleLoad(params, null)

  t.equal(result, false)
})

test('gistHandler.handleLoad with blank gist param, and invalid user input', function (t) {
  t.plan(3)

  var fakeWindow = {prompt: function (title, message, input, cb) {
    t.ok(message)
    t.ok(message.match(/gist/i))
    cb('invalid')
  }}

  var gistHandler = new GistHandler(fakeWindow)

  var params = {'gist': ''}
  var result = gistHandler.handleLoad(params, null)

  t.equal(result, true)
})

test('gistHandler.handleLoad with blank gist param, and valid user input', function (t) {
  t.plan(4)

  var fakeWindow = {prompt: function (title, message, input, cb) {
    t.ok(message)
    t.ok(message.match(/gist/i))
    cb('Beef1234')
  }}

  var cb = function (gistId) {
    t.equal(gistId, 'Beef1234')
  }

  var gistHandler = new GistHandler(fakeWindow)

  var params = {'gist': ''}
  var result = gistHandler.handleLoad(params, cb)

  t.equal(result, true)
})

test('gistHandler.handleLoad with gist param', function (t) {
  t.plan(2)

  var gistHandler = new GistHandler({})

  var params = {'gist': 'abc'}

  var cb = function (gistId) {
    t.equal(gistId, 'abc')
  }

  var result = gistHandler.handleLoad(params, cb)

  t.equal(result, true)
})
