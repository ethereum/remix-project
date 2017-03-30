'use strict'

var test = require('tape')

var Compiler = require('../src/app/compiler')

test('compiler.compile smoke', function (t) {
  t.plan(1)

  var noop = function () {}
  var fakeImport = function (url, cb) { cb('Not implemented') }
  var compiler = new Compiler(fakeImport)
  compiler.setCompileJSON(noop)
  compiler.compile({ 'test': '' }, 'test')
  t.ok(compiler)
})
