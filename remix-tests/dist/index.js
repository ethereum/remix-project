"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var runTestFiles_1 = __importDefault(require("./runTestFiles"));
var runTestSources_1 = __importDefault(require("./runTestSources"));
var testRunner_1 = __importDefault(require("./testRunner"));
module.exports = {
    runTestFiles: runTestFiles_1.default,
    runTestSources: runTestSources_1.default,
    runTest: testRunner_1.default,
    assertLibCode: require('../sol/tests.sol.js')
};
//# sourceMappingURL=index.js.map