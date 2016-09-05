var solc = require('solc/wrapper');

var compileJSON = function () { return ''; };
var missingInputs = [];

module.exports = function (self) {
  self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
      case 'loadVersion':
        delete self.Module;
        compileJSON = null;

        self.importScripts(data.data);

        var compiler = solc(self.Module);

        compileJSON = function (input, optimize) {
          try {
            return JSON.stringify(compiler.compile(JSON.parse(input), optimize, function (path) {
              missingInputs.push(path);
              return { 'error': 'Deferred import' };
            }));
          } catch (exception) {
            return JSON.stringify({ error: 'Uncaught JavaScript exception:\n' + exception });
          }
        };

        self.postMessage({
          cmd: 'versionLoaded',
          data: compiler.version(),
          acceptsMultipleFiles: compiler.supportsMulti
        });
        break;
      case 'compile':
        missingInputs.length = 0;
        self.postMessage({cmd: 'compiled', data: compileJSON(data.source, data.optimize), missingInputs: missingInputs, source: data.source});
        break;
    }
  }, false);
};
