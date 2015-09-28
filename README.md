
#Browser-solidity

Browser solidity is a browser based solidity compiler. To use either visit https://chriseth.github.io/browser-solidity or clone/download this repo and open `index.html` in your browser.

#Solidity compiler

To use the solidity compiler via nodejs you can do the following:

	var solc = require('solc');
	var compileJSON = solc.cwrap("compileJSON", "string", ["string", "number"]);
	var input = "contract x { function g() {} }";
	var output = JSON.parse(compileJSON(input, 1)); // 1 activates the optimiser
	for (var contractName in output.contracts)
		console.log(contractName + ': ' + output.contracts[contractName].bytecode);