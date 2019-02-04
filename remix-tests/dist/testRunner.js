"use strict";
var async = require("async");
var changeCase = require("change-case");
var Web3 = require("web3");
function getFunctionFullName(signature, methodIdentifiers) {
    for (var method in methodIdentifiers) {
        if (signature.replace('0x', '') === methodIdentifiers[method].replace('0x', '')) {
            return method;
        }
    }
    return null;
}
function getOverridedSender(userdoc, signature, methodIdentifiers) {
    var fullName = getFunctionFullName(signature, methodIdentifiers);
    var match = /sender: account-+(\d)/g;
    var accountIndex = userdoc.methods[fullName] ? match.exec(userdoc.methods[fullName].notice) : null;
    return fullName && accountIndex ? accountIndex[1] : null;
}
function getAvailableFunctions(jsonInterface) {
    return jsonInterface.reverse().filter(function (x) { return x.type === 'function'; }).map(function (x) { return x.name; });
}
function getTestFunctions(jsonInterface) {
    var specialFunctions = ['beforeAll', 'beforeEach', 'afterAll', 'afterEach'];
    return jsonInterface.filter(function (x) { return specialFunctions.indexOf(x.name) < 0 && x.type === 'function'; });
}
function createRunList(jsonInterface) {
    var availableFunctions = getAvailableFunctions(jsonInterface);
    var testFunctions = getTestFunctions(jsonInterface);
    var runList = [];
    if (availableFunctions.indexOf('beforeAll') >= 0) {
        runList.push({ name: 'beforeAll', type: 'internal', constant: false });
    }
    for (var _i = 0, testFunctions_1 = testFunctions; _i < testFunctions_1.length; _i++) {
        var func = testFunctions_1[_i];
        if (availableFunctions.indexOf('beforeEach') >= 0) {
            runList.push({ name: 'beforeEach', type: 'internal', constant: false });
        }
        runList.push({ name: func.name, signature: func.signature, type: 'test', constant: func.constant });
        if (availableFunctions.indexOf('afterEach') >= 0) {
            runList.push({ name: 'afterEach', type: 'internal', constant: false });
        }
    }
    if (availableFunctions.indexOf('afterAll') >= 0) {
        runList.push({ name: 'afterAll', type: 'internal', constant: false });
    }
    return runList;
}
function runTest(testName, testObject, contractDetails, opts, testCallback, resultsCallback) {
    var runList = createRunList(testObject._jsonInterface);
    var passingNum = 0;
    var failureNum = 0;
    var timePassed = 0;
    var web3 = new Web3();
    var userAgent = (typeof (navigator) !== 'undefined') && navigator.userAgent ? navigator.userAgent.toLowerCase() : '-';
    var isBrowser = !(typeof (window) === 'undefined' || userAgent.indexOf(' electron/') > -1);
    if (!isBrowser) {
        var signale = require('signale');
        signale.warn('DO NOT TRY TO ACCESS (IN YOUR SOLIDITY TEST) AN ACCOUNT GREATER THAN THE LENGTH OF THE FOLLOWING ARRAY (' + opts.accounts.length + ') :');
        signale.warn(opts.accounts);
        signale.warn('e.g: the following code won\'t work in the current context:');
        signale.warn('TestsAccounts.getAccount(' + opts.accounts.length + ')');
    }
    testCallback({ type: 'contract', value: testName, filename: testObject.filename });
    async.eachOfLimit(runList, 1, function (func, index, next) {
        var sender;
        if (func.signature) {
            sender = getOverridedSender(contractDetails.userdoc, func.signature, contractDetails.evm.methodIdentifiers);
            if (opts.accounts) {
                sender = opts.accounts[sender];
            }
        }
        var sendParams;
        if (sender)
            sendParams = { from: sender };
        var method = testObject.methods[func.name].apply(testObject.methods[func.name], []);
        var startTime = Date.now();
        if (func.constant) {
            method.call(sendParams).then(function (result) {
                var time = Math.ceil((Date.now() - startTime) / 1000.0);
                if (result) {
                    testCallback({ type: 'testPass', value: changeCase.sentenceCase(func.name), time: time, context: testName });
                    passingNum += 1;
                    timePassed += time;
                }
                else {
                    testCallback({ type: 'testFailure', value: changeCase.sentenceCase(func.name), time: time, errMsg: 'function returned false', context: testName });
                    failureNum += 1;
                }
                next();
            });
        }
        else {
            method.send(sendParams).on('receipt', function (receipt) {
                try {
                    var time = Math.ceil((Date.now() - startTime) / 1000.0);
                    var topic = Web3.utils.sha3('AssertionEvent(bool,string)');
                    var testPassed = false;
                    for (var i in receipt.events) {
                        var event_1 = receipt.events[i];
                        if (event_1.raw.topics.indexOf(topic) >= 0) {
                            var testEvent = web3.eth.abi.decodeParameters(['bool', 'string'], event_1.raw.data);
                            if (!testEvent[0]) {
                                testCallback({ type: 'testFailure', value: changeCase.sentenceCase(func.name), time: time, errMsg: testEvent[1], context: testName });
                                failureNum += 1;
                                return next();
                            }
                            testPassed = true;
                        }
                    }
                    if (testPassed) {
                        testCallback({ type: 'testPass', value: changeCase.sentenceCase(func.name), time: time, context: testName });
                        passingNum += 1;
                    }
                    return next();
                }
                catch (err) {
                    console.log('error!');
                    console.dir(err);
                    return next(err);
                }
            }).on('error', function (err) {
                console.error(err);
                next(err);
            });
        }
    }, function (error) {
        resultsCallback(error, {
            passingNum: passingNum,
            failureNum: failureNum,
            timePassed: timePassed
        });
    });
}
module.exports = runTest;
//# sourceMappingURL=testRunner.js.map