var version = function () { return '(loading)'; };
var compileJSON = function () { return ''; };
var missingInputs = [];

module.exports = function (self) {
  self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
      case 'loadVersion':
        delete self.Module;
        version = null;
        compileJSON = null;

        self.importScripts(data.data);
        var Module = self.Module;

        version = Module.cwrap('version', 'string', []);
        if ('_compileJSONCallback' in Module) {
          var compileJSONInternal = Module.cwrap('compileJSONCallback', 'string', ['string', 'number', 'number']);
          var missingInputCallback = Module.Runtime.addFunction(function (path) {
            missingInputs.push(Module.Pointer_stringify(path));
          });
          compileJSON = function (input, optimize) {
            return compileJSONInternal(input, optimize, missingInputCallback);
          };
        } else if ('_compileJSONMulti' in Module) {
          compileJSON = Module.cwrap('compileJSONMulti', 'string', ['string', 'number']);
        } else {
          compileJSON = Module.cwrap('compileJSON', 'string', ['string', 'number']);
        }
        self.postMessage({
          cmd: 'versionLoaded',
          data: version(),
          acceptsMultipleFiles: ('_compileJSONMulti' in Module)
        });
        break;
      case 'compile':
        missingInputs.length = 0;
        self.postMessage({cmd: 'compiled', data: compileJSON(data.source, data.optimize), missingInputs: missingInputs});
        break;
    }
  }, false);
};
