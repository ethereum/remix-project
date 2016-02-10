function setupMethods (soljson){

	var compileJSON = soljson.cwrap("compileJSON", "string", ["string", "number"]);
	var compileJSONMulti =
		'_compileJSONMulti' in soljson ?
		soljson.cwrap("compileJSONMulti", "string", ["string", "number"]) :
		null;
	var compileJSONCallback = null;
	if ('_compileJSONCallback' in soljson)
	{
		/// TODO: Allocating memory and copying the strings over
		/// to the emscripten runtime does not seem to work.
		var copyString = function(str, ptr) {
			var buffer = soljson._malloc(str.length + 1);
			soljson.writeStringToMemory(str, buffer);
			soljson.setValue(ptr, buffer, '*');
		};
		var wrapCallback = function(callback) {
			return soljson.Runtime.addFunction(function(path, contents, error) {
				// path is char*, contents is char**, error is char**
				// TODO copying the results does not seem to work.
				// This is not too bad, because most of the requests
				// cannot be answered synchronously anyway.
				var result = callback(soljson.Pointer_stringify(path));
				if (typeof(result.contents) === typeof(''))
					copyString(result.contents, contents);
				if (typeof(result.error) === typeof(''))
					copyString(result.error, error);
			});
		};
		var compileInternal = soljson.cwrap("compileJSONCallback", "string", ["string", "number", "number"]);
		compileJSONCallback = function(input, optimize, readCallback) {
			var cb = wrapCallback(readCallback);
			var output = compileInternal(input, optimize, cb);
			soljson.Runtime.removeFunction(cb);
			return output;
		};
	}

	var compile = function(input, optimise, readCallback) {
		var result = '';
		if (readCallback !== undefined && compileJSONCallback !== null)
			result = compileJSONCallback(JSON.stringify(input), optimise, readCallback);
		if (typeof(input) != typeof('') && compileJSONMulti !== null)
			result = compileJSONMulti(JSON.stringify(input), optimise);
		else
			result = compileJSON(input, optimise);
		return JSON.parse(result);
	}

	var version = soljson.cwrap("version", "string", []);

	return {
		version: version,
		compile: compile,
		useVersion: function( versionString ){
			return setupMethods( require('./bin/soljson-' + versionString + '.js' ) );
		}
	}
}

module.exports = setupMethods( require('./bin/soljson-latest.js') );
