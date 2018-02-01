let fs = require('fs');
//let compiler = require('solc');
var async = require('async');

let remixLib = require('remix-lib');
let compilerInput = remixLib.helpers.compiler;
let RemixCompiler = require('remix-solidity').Compiler;

// TODO: replace this with remix's own compiler code
function compileAll(cb) {
  //const input = {
  //  "simple_storage.sol": fs.readFileSync("examples/simple_storage.sol").toString(),
  //  "tests.sol": fs.readFileSync("examples/tests.sol").toString(),
  //  "simple_storage_test.sol": fs.readFileSync("examples/simple_storage_test.sol").toString()
  //};
  //const optimize = 1;
  //result = compiler.compileStandardWrapper({sources: input}, optimize);
  //cb(null, result.contracts);

  console.log("compile all");

  let compiler;
  const sources = {
    "simple_storage.sol": {content: fs.readFileSync("examples/simple_storage.sol").toString()},
    "tests.sol": {content: fs.readFileSync("examples/tests.sol").toString()},
    "simple_storage_test.sol": {content: fs.readFileSync("examples/simple_storage_test.sol").toString()}
  };

  async.waterfall([
    function loadCompiler(next) {
      console.log("loadCompiler");
      compiler = new RemixCompiler();
      compiler.onInternalCompilerLoaded();
      //compiler.event.register('compilerLoaded', this, function (version) {
        next();
      //});
    },
    function doCompilation(next) {
      compiler.event.register('compilationFinished', this, function (success, data, source) {
        next(null, data);
      });
      console.log("doCompilation");
      compiler.compile(sources, "examples/");
    }
  ], function(err, result) {
    console.dir("==== result ====");
    console.dir(result);
    cb(null, result.contracts);
  });

}

module.exports = {
  compileAll: compileAll
}

