var async = require('async');
var changeCase = require('change-case');
require('colors');

function runTest(testName, testObject, accounts, callback) {
  let runList = [];
  let specialFunctions = ['beforeAll'];
  let availableFunctions = testObject._jsonInterface.filter((x) => x.type === 'function').map((x) => x.name);
  let testFunctions = testObject._jsonInterface.filter((x) => specialFunctions.indexOf(x.name) < 0 && x.type === 'function');

  if (availableFunctions.indexOf("beforeAll")) {
    runList.push({name: 'beforeAll', type: 'internal', constant: false});
  }

  for (let func of testFunctions) {
    runList.push({name: func.name, type: 'test', constant: func.constant});
  }

  console.log("#" + testName);
  async.eachOfLimit(runList, 1, function(func, index, next) {
    let method = testObject.methods[func.name].apply(testObject.methods[func.name], []);
    if (func.constant) {
      method.call().then((result) => {
        if (result) {
          // TODO: should instead be returned in a callback, the caller can
          // decide how to handle the output (so works both in console and
          // browser)
          console.log("\t✓ ".green.bold + changeCase.sentenceCase(func.name).grey);
        } else {
          console.log("\t✘ ".bold.red + changeCase.sentenceCase(func.name).red);
        }
        next();
      });
    } else {
      method.send().then(() => {
        next();
      });
    }
  }, function() {
    console.log("1 passing".green);
    console.log("1 failing".red);
  });
}

module.exports = {
  runTest: runTest
}
