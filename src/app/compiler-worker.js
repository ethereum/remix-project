var version = function() { return '(loading)'; }
var compileJSON = function() { return ''; }
var missingInputs = [];

module.exports = function (self) {
	self.addEventListener('message', function(e) {
		var data = e.data;
		switch (data.cmd) {
			case 'loadVersion':
				delete Module;
				version = null;
				compileJSON = null;

				importScripts(data.data);
				version = Module.cwrap("version", "string", []);
				if ('_compileJSONCallback' in Module)
				{
					compileJSONInternal = Module.cwrap("compileJSONCallback", "string", ["string", "number", "number"]);
					var missingInputCallback = Module.Runtime.addFunction(function(path) {
						missingInputs.push(Module.Pointer_stringify(path));
					});
					compileJSON = function(input, optimize) {
						return compileJSONInternal(input, optimize, missingInputCallback);
					};
				}
				else if ('_compileJSONMulti' in Module)
					compileJSON = Module.cwrap("compileJSONMulti", "string", ["string", "number"]);
				else
					compileJSON = Module.cwrap("compileJSON", "string", ["string", "number"]);
				postMessage({
					cmd: 'versionLoaded',
					data: version(),
					acceptsMultipleFiles: ('_compileJSONMulti' in Module)
				});
				break;
			case 'compile':
				missingInputs.length = 0;
				postMessage({cmd: 'compiled', data: compileJSON(data.source, data.optimize), missingInputs: missingInputs});
				break;
		}
	}, false);
}
