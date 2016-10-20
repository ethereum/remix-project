var fs = require('fs');
var solc = require('solc/wrapper');
var soljson = require('../soljson');
var compiler = solc(soljson);
var inputs = require('../test-browser/mockcompiler/requests.js');
var compilationResult = gatherCompilationResults(inputs);
replaceSolCompiler(compilationResult);

function gatherCompilationResults (sol) {
  var compilationResult = {};
  for (var k in sol) {
    var item = sol[k];
    var result = compile(item, 1);
    compilationResult[result.key] = result;
    result = compile(item, 0);
    compilationResult[result.key] = result;
  }
  return compilationResult;
}

function compile (source, optimization) {
  var missingInputs = [];
  var result = compiler.compile(source, optimization, function (path) {
    missingInputs.push(path);
  });
  var key = optimization.toString();
  for (var k in source.sources) {
    key += k + source.sources[k];
  }
  key = key.replace(/(\t)|(\n)|( )/g, '');
  return {
    key: key,
    source: source,
    optimization: optimization,
    missingInputs: missingInputs,
    result: result
  };
}

function replaceSolCompiler (results) {
  fs.readFile('./test-browser/mockcompiler/compiler.js', 'utf8', function (error, data) {
    if (error) {
      console.log(error);
      process.exit(1);
      return;
    }
    data = data + '\n\nvar mockData = ' + JSON.stringify(results) + ';\n';
    fs.writeFile('./soljson.js', data, 'utf8', function (error) {
      if (error) {
        console.log(error);
        process.exit(1);
        return;
      }
    });
  });
}
