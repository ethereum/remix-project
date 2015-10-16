var version = function() { return '(loading)'; }
var compileJSON = function() { return ''; }
addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'loadVersion':
			delete Module;
			version = null;
			compileJSON = null;

			importScripts(data.data);
			version = Module.cwrap("version", "string", []);
			if ('_compileJSONMulti' in Module)
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
			postMessage({cmd: 'compiled', data: compileJSON(data.source, data.optimize)});
			break;
	}
}, false);
