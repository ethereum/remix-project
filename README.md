
#Browser-solidity

Browser solidity is a browser based solidity compiler. To use either visit [https://chriseth.github.io/browser-solidity](https://chriseth.github.io/browser-solidity) or clone/download this repo and open `index.html` in your browser.

#Nodejs usage

To use the solidity compiler via nodejs you can install it via npm

	npm install solc

And then use it like so:

	var solc = require('solc');
	var input = "contract x { function g() {} }";
	var output = solc.compile(input, 1); // 1 activates the optimiser
	for (var contractName in output.contracts)
		console.log(contractName + ': ' + output.contracts[contractName].bytecode);