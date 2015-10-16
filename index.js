
var soljson = require('./bin/soljson-latest.js');

var compileJSON = soljson.cwrap("compileJSON", "string", ["string", "number"]);
var compileJSONMulti =
	'_compileJSONMulti' in soljson ?
	soljson.cwrap("compileJSONMulti", "string", ["string", "number"]) :
	null;

var compile = function(input, optimise) {
	var result = '';
	if (typeof(input) != typeof('') && compileJSONMulti !== null)
		result = compileJSONMulti(JSON.stringify(input), optimise);
	else
		result = compileJSON(input, optimise);
	return JSON.parse(result);
}


module.exports = {
	compile: compile,
	version: soljson.cwrap("version", "string", [])
}
