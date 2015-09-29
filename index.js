
var soljson = require('./bin/soljson-latest.js');

compileJSON = soljson.cwrap("compileJSON", "string", ["string", "number"]);

module.exports = {
	compile: function(input, optimise){
		return JSON.parse( compileJSON(input, optimise) );
	}
}