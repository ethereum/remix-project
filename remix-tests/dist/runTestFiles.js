"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var async = require("async");
var path = require("path");
var fs = require("./fs");
var testRunner_1 = __importDefault(require("./testRunner"));
require('colors');
var Compiler = require("./compiler.js");
var Deployer = require("./deployer.js");
function runTestFiles(filepath, isDirectory, web3, opts) {
    opts = opts || {};
    var Signale = require('signale').Signale;
    // signale configuration
    var options = {
        types: {
            result: {
                badge: '\t✓',
                label: '',
                color: 'greenBright'
            },
            name: {
                badge: '\n\t◼',
                label: '',
                color: 'white'
            },
            error: {
                badge: '\t✘',
                label: '',
                color: 'redBright'
            }
        }
    };
    var signale = new Signale(options);
    var accounts = opts.accounts || null;
    async.waterfall([
        function getAccountList(next) {
            if (accounts)
                return next(null);
            web3.eth.getAccounts(function (_err, _accounts) {
                accounts = _accounts;
                next(null);
            });
        },
        function compile(next) {
            Compiler.compileFileOrFiles(filepath, isDirectory, { accounts: accounts }, next);
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
            var gatherContractsFrom = function (filename) {
                if (filename.indexOf('_test.sol') < 0) {
                    return;
                }
                Object.keys(compilationResult[path.basename(filename)]).forEach(function (contractName) {
                    contractsToTest.push(contractName);
                    contractsToTestDetails.push(compilationResult[path.basename(filename)][contractName]);
                });
            };
            if (isDirectory) {
                fs.walkSync(filepath, function (foundpath) {
                    gatherContractsFrom(foundpath);
                });
            }
            else {
                gatherContractsFrom(filepath);
            }
            next(null, contractsToTest, contractsToTestDetails, contracts);
        },
        function runTests(contractsToTest, contractsToTestDetails, contracts, next) {
            var totalPassing = 0;
            var totalFailing = 0;
            var totalTime = 0;
            var errors = [];
            var testCallback = function (result) {
                if (result.type === 'contract') {
                    signale.name(result.value.white);
                }
                else if (result.type === 'testPass') {
                    signale.result(result.value);
                }
                else if (result.type === 'testFailure') {
                    signale.result(result.value.red);
                    errors.push(result);
                }
            };
            var resultsCallback = function (_err, result, cb) {
                totalPassing += result.passingNum;
                totalFailing += result.failureNum;
                totalTime += result.timePassed;
                cb();
            };
            async.eachOfLimit(contractsToTest, 1, function (contractName, index, cb) {
                testRunner_1.default(contractName, contracts(contractName), contractsToTestDetails[index], { accounts: accounts }, testCallback, function (err, result) {
                    if (err) {
                        return cb(err);
                    }
                    resultsCallback(null, result, cb);
                });
            }, function (err) {
                if (err) {
                    return next(err);
                }
                console.log('\n');
                if (totalPassing > 0) {
                    console.log(('%c  ' + totalPassing + ' passing ') + ('%c(' + totalTime + 's)'), 'color: green', 'color: grey');
                }
                if (totalFailing > 0) {
                    console.log(('%c  ' + totalFailing + ' failing'), 'color: red');
                }
                console.log('');
                errors.forEach(function (error, index) {
                    console.log('  ' + (index + 1) + ') ' + error.context + ' ' + error.value);
                    console.log('');
                    console.log(('%c\t error: ' + error.errMsg), 'color: red');
                });
                console.log('');
                next();
            });
        }
    ], function () {
    });
}
module.exports = runTestFiles;
//# sourceMappingURL=runTestFiles.js.map