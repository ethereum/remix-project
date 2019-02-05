"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var async_1 = __importDefault(require("async"));
require('colors');
var Compiler = require("./compiler.js");
var Deployer = require("./deployer.js");
var testRunner_1 = __importDefault(require("./testRunner"));
var Web3 = require("web3");
var remix_simulator_1 = __importDefault(require("remix-simulator"));
var createWeb3Provider = function () {
    var web3 = new Web3();
    web3.setProvider(new remix_simulator_1.default());
    return web3;
};
function runTestSources(contractSources, testCallback, resultCallback, finalCallback, importFileCb, opts) {
    opts = opts || {};
    var web3 = opts.web3 || createWeb3Provider();
    var accounts = opts.accounts || null;
    async_1.default.waterfall([
        function getAccountList(next) {
            if (accounts)
                return next();
            web3.eth.getAccounts(function (_err, _accounts) {
                accounts = _accounts;
                next();
            });
        },
        function compile(next) {
            Compiler.compileContractSources(contractSources, importFileCb, next);
        },
        function deployAllContracts(compilationResult, next) {
            Deployer.deployAll(compilationResult, web3, function (err, contracts) {
                if (err) {
                    next(err);
                }
                next(null, compilationResult, contracts);
            });
        },
        function determineTestContractsToRun(compilationResult, contracts, next) {
            var contractsToTest = [];
            var contractsToTestDetails = [];
            var _loop_1 = function (filename) {
                if (filename.indexOf('_test.sol') < 0) {
                    return "continue";
                }
                Object.keys(compilationResult[filename]).forEach(function (contractName) {
                    contractsToTestDetails.push(compilationResult[filename][contractName]);
                    contractsToTest.push(contractName);
                });
            };
            for (var filename in compilationResult) {
                _loop_1(filename);
            }
            next(null, contractsToTest, contractsToTestDetails, contracts);
        },
        function runTests(contractsToTest, contractsToTestDetails, contracts, next) {
            var totalPassing = 0;
            var totalFailing = 0;
            var totalTime = 0;
            var errors = [];
            var _testCallback = function (result) {
                if (result.type === 'testFailure') {
                    errors.push(result);
                }
                testCallback(result);
            };
            var _resultsCallback = function (_err, result, cb) {
                resultCallback(_err, result, function () { });
                totalPassing += result.passingNum;
                totalFailing += result.failureNum;
                totalTime += result.timePassed;
                cb();
            };
            async_1.default.eachOfLimit(contractsToTest, 1, function (contractName, index, cb) {
                testRunner_1.default(contractName, contracts(contractName), contractsToTestDetails[index], { accounts: accounts }, _testCallback, function (err, result) {
                    if (err) {
                        return cb(err);
                    }
                    _resultsCallback(null, result, cb);
                });
            }, function (err) {
                if (err) {
                    return next(err);
                }
                var finalResults = {
                    totalPassing: 0,
                    totalFailing: 0,
                    totalTime: 0,
                    errors: [],
                };
                finalResults.totalPassing = totalPassing || 0;
                finalResults.totalFailing = totalFailing || 0;
                finalResults.totalTime = totalTime || 0;
                finalResults.errors = [];
                errors.forEach(function (error, _index) {
                    finalResults.errors.push({ context: error.context, value: error.value, message: error.errMsg });
                });
                next(null, finalResults);
            });
        }
    ], finalCallback);
}
module.exports = runTestSources;
//# sourceMappingURL=runTestSources.js.map