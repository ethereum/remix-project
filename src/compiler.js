let fs = require('fs');
let solc = require('solc');

// TODO: replace this with remix's own compiler code
function compileAll() {
  const input = {
    "simple_storage.sol": fs.readFileSync("examples/simple_storage.sol").toString(),
    "tests.sol": fs.readFileSync("examples/tests.sol").toString(),
    "simple_storage_test.sol": fs.readFileSync("examples/simple_storage_test.sol").toString()
  };

  const optimize = 1;
  result = solc.compile({sources: input}, optimize);

  return result.contracts;
}

module.exports = {
  compileAll: compileAll
}

