var test = require('tape')
var remixLib = require('remix-lib')

var StatRunner = require('../../src/solidity-analyzer')
var compilerInput = remixLib.helpers.compiler.compilerInput

var compiler = require('solc')

var fs = require('fs')
var path = require('path')

var testFiles = [
  'KingOfTheEtherThrone.sol',
  'assembly.sol',
  'ballot.sol',
  'ballot_reentrant.sol',
  'ballot_withoutWarnings.sol',
  'cross_contract.sol',
  'inheritance.sol',
  'modifier1.sol',
  'modifier2.sol',
  'notReentrant.sol',
  'structReentrant.sol',
  'thisLocal.sol',
  'globals.sol',
  'library.sol',
  'transfer.sol',
  'ctor.sol',
  'forgottenReturn.sol',
  'selfdestruct.sol',
  'deleteDynamicArray.sol',
  'blockLevelCompare.sol',
  'intDivisionTruncate.sol'
]

var testFileAsts = {}

testFiles.forEach((fileName) => {
  var content = fs.readFileSync(path.join(__dirname, 'test-contracts', fileName), 'utf8')
  testFileAsts[fileName] = JSON.parse(compiler.compileStandardWrapper(compilerInput(content)))
})

test('Integration test thisLocal.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/thisLocal')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 1,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 1,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of this local warnings`)
  })
})

test('Integration test checksEffectsInteraction.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/checksEffectsInteraction')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 1,
    'assembly.sol': 1,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 1,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 1,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 1,
    'thisLocal.sol': 0,
    'globals.sol': 1,
    'library.sol': 1,
    'transfer.sol': 1,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of checks-effects-interaction warnings`)
  })
})

test('Integration test constantFunctions.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/constantFunctions')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 1,
    'inheritance.sol': 0,
    'modifier1.sol': 1,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 1,
    'thisLocal.sol': 1,
    'globals.sol': 0,
    'library.sol': 3,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 1,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of constant warnings`)
  })
})

test('Integration test inlineAssembly.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/inlineAssembly')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 2,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of inline assembly warnings`)
  })
})

test('Integration test txOrigin.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/txOrigin')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 1,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 1,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of tx.origin warnings`)
  })
})

test('Integration test gasCosts.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/gasCosts')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 2,
    'assembly.sol': 2,
    'ballot.sol': 3,
    'ballot_reentrant.sol': 2,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 1,
    'inheritance.sol': 1,
    'modifier1.sol': 0,
    'modifier2.sol': 1,
    'notReentrant.sol': 1,
    'structReentrant.sol': 1,
    'thisLocal.sol': 1,
    'globals.sol': 1,
    'library.sol': 1,
    'transfer.sol': 1,
    'ctor.sol': 0,
    'forgottenReturn.sol': 3,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 2,
    'blockLevelCompare.sol': 1,
    'intDivisionTruncate.sol': 1
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of gasCost warnings`)
  })
})

test('Integration test similarVariableNames.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/similarVariableNames')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 2,
    'ballot_reentrant.sol': 3,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 1,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 1,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 1,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of similarVariableNames warnings`)
  })
})

test('Integration test inlineAssembly.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/inlineAssembly')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 2,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of inlineAssembly warnings`)
  })
})

test('Integration test blockTimestamp.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/blockTimestamp')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 1,
    'assembly.sol': 0,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 3,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 2,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of blockTimestamp warnings`)
  })
})

test('Integration test lowLevelCalls.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/lowLevelCalls')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 1,
    'assembly.sol': 1,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 7,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 1,
    'inheritance.sol': 1,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 1,
    'structReentrant.sol': 1,
    'thisLocal.sol': 2,
    'globals.sol': 1,
    'library.sol': 1,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of lowLevelCalls warnings`)
  })
})

test('Integration test blockBlockhash.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/blockBlockhash')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 0, // was 1 !! @TODO
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of blockBlockhash warnings`)
  })
})

test('Integration test noReturn.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/noReturn')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 1,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 1,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 1,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 1,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of noReturn warnings`)
  })
})

test('Integration test selfdestruct.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/selfdestruct')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 1,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 2,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 1
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of selfdestruct warnings`)
  })
})

test('Integration test guardConditions.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/guardConditions')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 1,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 1,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 1,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 1
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of guardCondition warnings`)
  })
})

test('Integration test deleteDynamicArrays.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/deleteDynamicArrays')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 2,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of deleteDynamicArrays warnings`)
  })
})

test('Integration test assignAndCompare.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/assignAndCompare')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 8,
    'intDivisionTruncate.sol': 0
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of assignAndCompare warnings`)
  })
})

test('Integration test intDivisionTruncate.js', function (t) {
  t.plan(testFiles.length)

  var module = require('../../src/solidity-analyzer/modules/intDivisionTruncate')

  var lengthCheck = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 0,
    'ballot_reentrant.sol': 0,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 0,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 2
  }

  runModuleOnFiles(module, t, (file, report) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of intDivisionTruncate warnings`)
  })
})

// #################### Helpers
function runModuleOnFiles (module, t, cb) {
  var statRunner = new StatRunner()

  testFiles.forEach((fileName) => {
    statRunner.runWithModuleList(testFileAsts[fileName], [{ name: module.name, mod: new module.Module() }], (reports) => {
      let report = reports[0].report
      if (report.some((x) => x['warning'].includes('INTERNAL ERROR'))) {
        t.comment('Error while executing Module: ' + JSON.stringify(report))
      }
      cb(fileName, report)
    })
  })
}
