// import { default as test} from "tape"
// import { helpers } from 'remix-lib'
// import { readFileSync } from 'fs'
// import { join } from 'path'
// import { default as StatRunner } from '../../dist/src/solidity-analyzer'
// import { install, require as requireNPMmodule } from 'npm-install-version'
// install('solc@0.5.0')
// const compiler = requireNPMmodule('solc@0.5.0')
// const {compilerInput  } = helpers.compiler
// const folder = 'solidity-v0.5'

// const testFiles = [
//   'KingOfTheEtherThrone.sol',
//   'assembly.sol',
//   'ballot.sol',
//   'ballot_reentrant.sol',
//   'ballot_withoutWarnings.sol',
//   'cross_contract.sol',
//   'inheritance.sol',
//   'modifier1.sol',
//   'modifier2.sol',
//   'notReentrant.sol',
//   'structReentrant.sol',
//   'thisLocal.sol',
//   'globals.sol',
//   'library.sol',
//   'transfer.sol',
//   'ctor.sol',
//   'forgottenReturn.sol',
//   'selfdestruct.sol',
//   'deleteDynamicArray.sol',
//   'deleteFromDynamicArray.sol',
//   'blockLevelCompare.sol',
//   'intDivisionTruncate.sol',
//   'ERC20.sol',
//   'stringBytesLength.sol',
//   'etherTransferInLoop.sol',
//   'forLoopIteratesOverDynamicArray.sol'
// ]

// var testFileAsts = {}

// testFiles.forEach((fileName) => {
//   var content = readFileSync(join(__dirname, 'test-contracts/' + folder, fileName), 'utf8')
//   testFileAsts[fileName] = JSON.parse(compiler.compile(compilerInput(content)))
// })

// test('Integration test thisLocal.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/thisLocal').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 1,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 1,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of this local warnings`)
//   })
// })

// test('Integration test checksEffectsInteraction.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/checksEffectsInteraction').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 1,
//     'assembly.sol': 1,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 1,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 1,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 1,
//     'thisLocal.sol': 0,
//     'globals.sol': 1,
//     'library.sol': 1,
//     'transfer.sol': 1,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of checks-effects-interaction warnings`)
//   })
// })

// test('Integration test constantFunctions.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/constantFunctions').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 1,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 1,
//     'thisLocal.sol': 1,
//     'globals.sol': 0,
//     'library.sol': 3,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of constant warnings`)
//   })
// })

// test('Integration test inlineAssembly.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/inlineAssembly').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 2,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of inline assembly warnings`)
//   })
// })

// test('Integration test txOrigin.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/txOrigin').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 1,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 1,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of tx.origin warnings`)
//   })
// })

// test('Integration test gasCosts.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/gasCosts').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 2,
//     'assembly.sol': 2,
//     'ballot.sol': 3,
//     'ballot_reentrant.sol': 2,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 1,
//     'inheritance.sol': 1,
//     'modifier1.sol': 0,
//     'modifier2.sol': 1,
//     'notReentrant.sol': 1,
//     'structReentrant.sol': 1,
//     'thisLocal.sol': 1,
//     'globals.sol': 1,
//     'library.sol': 1,
//     'transfer.sol': 1,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 3,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 2,
//     'deleteFromDynamicArray.sol': 1,
//     'blockLevelCompare.sol': 1,
//     'intDivisionTruncate.sol': 1,
//     'ERC20.sol': 2,
//     'stringBytesLength.sol': 1,
//     'etherTransferInLoop.sol': 3,
//     'forLoopIteratesOverDynamicArray.sol': 2
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of gasCost warnings`)
//   })
// })

// test('Integration test similarVariableNames.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/similarVariableNames').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 2,
//     'ballot_reentrant.sol': 11,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 1,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 1,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 1,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of similarVariableNames warnings`)
//   })
// })

// test('Integration test inlineAssembly.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/inlineAssembly').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 2,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of inlineAssembly warnings`)
//   })
// })

// test('Integration test blockTimestamp.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/blockTimestamp').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 1,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 3,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 2,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of blockTimestamp warnings`)
//   })
// })

// test('Integration test lowLevelCalls.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/lowLevelCalls').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 1,
//     'assembly.sol': 1,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 7,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 1,
//     'inheritance.sol': 1,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 1,
//     'structReentrant.sol': 1,
//     'thisLocal.sol': 2,
//     'globals.sol': 1,
//     'library.sol': 1,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of lowLevelCalls warnings`)
//   })
// })

// test('Integration test blockBlockhash.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/blockBlockhash').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0, // was 1 !! @TODO
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of blockBlockhash warnings`)
//   })
// })

// /*

// ! No return gives compilation error with solidity 0.5.0

// test('Integration test noReturn.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/noReturn')

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 1,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 1,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 1,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 1,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of noReturn warnings`)
//   })
// })
// */

// test('Integration test selfdestruct.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/selfdestruct').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 2,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 3,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'ERC20.sol': 0,
//     'intDivisionTruncate.sol': 5,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of selfdestruct warnings`)
//   })
// })

// test('Integration test guardConditions.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/guardConditions').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 1,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 1,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 1,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 1,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of guardCondition warnings`)
//   })
// })

// test('Integration test deleteDynamicArrays.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/deleteDynamicArrays').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 2,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of deleteDynamicArrays warnings`)
//   })
// })

// test('Integration test deleteFromDynamicArray.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/deleteFromDynamicArray').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 1,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of deleteFromDynamicArray warnings`)
//   })
// })

// test('Integration test assignAndCompare.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/assignAndCompare').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 8,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of assignAndCompare warnings`)
//   })
// })

// test('Integration test intDivisionTruncate.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/intDivisionTruncate').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 2,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of intDivisionTruncate warnings`)
//   })
// })

// test('Integration test erc20Decimal.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/erc20Decimals').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 1,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of erc20Decimals warnings`)
//   })
// })

// test('Integration test stringBytesLength.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/stringBytesLength').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 1,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of stringBytesLength warnings`)
//   })
// })

// test('Integration test etherTransferInLoop.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/etherTransferInLoop').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 0,
//     'ballot_reentrant.sol': 0,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 3,
//     'forLoopIteratesOverDynamicArray.sol': 0
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of etherTransferInLoop warnings`)
//   })
// })

// test('Integration test forLoopIteratesOverDynamicArray.js', function (t) {
//   t.plan(testFiles.length)

//   var module = require('../../dist/src/solidity-analyzer/modules/forLoopIteratesOverDynamicArray').default

//   var lengthCheck = {
//     'KingOfTheEtherThrone.sol': 0,
//     'assembly.sol': 0,
//     'ballot.sol': 2,
//     'ballot_reentrant.sol': 1,
//     'ballot_withoutWarnings.sol': 0,
//     'cross_contract.sol': 0,
//     'inheritance.sol': 0,
//     'modifier1.sol': 0,
//     'modifier2.sol': 0,
//     'notReentrant.sol': 0,
//     'structReentrant.sol': 0,
//     'thisLocal.sol': 0,
//     'globals.sol': 0,
//     'library.sol': 0,
//     'transfer.sol': 0,
//     'ctor.sol': 0,
//     'forgottenReturn.sol': 0,
//     'selfdestruct.sol': 0,
//     'deleteDynamicArray.sol': 0,
//     'deleteFromDynamicArray.sol': 0,
//     'blockLevelCompare.sol': 0,
//     'intDivisionTruncate.sol': 0,
//     'ERC20.sol': 0,
//     'stringBytesLength.sol': 0,
//     'etherTransferInLoop.sol': 0,
//     'forLoopIteratesOverDynamicArray.sol': 2
//   }

//   runModuleOnFiles(module, t, (file, report) => {
//     t.equal(report.length, lengthCheck[file], `${file} has right amount of forLoopIteratesOverDynamicArray warnings`)
//   })
// })

// // #################### Helpers
// function runModuleOnFiles (Module, t, cb) {
//   var statRunner = new StatRunner()
//   testFiles.forEach((fileName) => {
//     statRunner.runWithModuleList(testFileAsts[fileName], [{ name: new Module().name, mod: new Module() }], (reports) => {
//       let report = reports[0].report
//       if (report.some((x) => x['warning'].includes('INTERNAL ERROR'))) {
//         t.comment('Error while executing Module: ' + JSON.stringify(report))
//       }
//       cb(fileName, report)
//     })
//   })
// }
