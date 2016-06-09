var test = require('tape');

var Compiler = require('../src/app/compiler');

test('compiler.compile smoke', function (t) {
  t.plan(1);

  var noop = function () {};
  var fakeEditor = {onChangeSetup: noop, clearAnnotations: noop, getValue: noop, setCacheFileContent: noop, getCacheFile: noop};
  var fakeOutputField = {empty: noop};
  var fakeQueryParams = {get: function () { return {}; }};
  var compiler = new Compiler(fakeEditor, null, fakeQueryParams, null, fakeOutputField);
  compiler.setCompileJSON(noop);
  compiler.compile();
  t.ok(compiler);
});
