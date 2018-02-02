const async = require('async');
const Web3 = require('web3');
const assert = require('assert');

let Compiler = require('../src/compiler.js');
let Deployer = require('../src/deployer.js');
let TestRunner = require('../src/testRunner.js');

function compileAndDeploy(filename, callback) {
  let web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

  async.waterfall([
    function compile(next) {
      Compiler.compileFile(filename, next);
    },
    function deployAllContracts(compilationResult, next) {
      Deployer.deployAll(compilationResult, web3, next);
    }
  ], function(_err, contracts) {
    callback(null, contracts);
  });
}

describe('testRunner', function() {
  describe("simple test", function() {
    let filename = 'examples/simple_storage_test.sol'
    let tests = [], results = {};

    before(function(done) {
      compileAndDeploy(filename, function(_err, contracts) {
        var testCallback = function() {
          console.log("testCallback");
          console.dir(arguments);
          tests.push(arguments);
        }
        var resultsCallback = function(_err, _results) {
          console.log("resultsCallback");
          console.dir(_results);
          results = _results;
          done();
        }
        TestRunner.runTest(filename, contracts.MyTest, testCallback, resultsCallback);
      });
    });

    it('should 1 passing test', function() {
      assert.equal(results.passingNum, 1)
    });

    it('should 1 passing test', function() {
      assert.equal(results.failureNum, 1)
    });

  });
});
