var test = require('tape');

var Compiler = require('../src/app/compiler');

test('compiler.compile smoke', function (t) {
  t.plan(1);

  var noop = function () {};
  var getCacheFile = function () { return 'fakeCacheFile'; };
  var fakeEditor = {onChangeSetup: noop, clearAnnotations: noop, getValue: noop, setCacheFileContent: noop, getCacheFile: getCacheFile};
  var fakeQueryParams = {get: function () { return {}; }};
  var compiler = new Compiler(fakeEditor, fakeQueryParams, null, null);
  compiler.setCompileJSON(noop);
  compiler.compile();
  t.ok(compiler);
});
