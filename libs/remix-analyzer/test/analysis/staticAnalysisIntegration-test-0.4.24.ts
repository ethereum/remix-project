import test from "tape"
import { helpers } from '@remix-project/remix-lib'
import { readFileSync } from 'fs'
import { join } from 'path'
import { default as StatRunner } from '../../src/solidity-analyzer'
import * as modules from '../../src/solidity-analyzer/modules/'
import { CompilationResult, AnalysisReportObj, AnalysisReport } from '../../src/types'
import solcOrg from 'solc';
const { compilerInput } = helpers.compiler
const folder: string = 'solidity-v0.4.24'

const testFiles: string[] = [
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
  'deleteFromDynamicArray.sol',
  'blockLevelCompare.sol',
  'intDivisionTruncate.sol',
  'ERC20.sol',
  'stringBytesLength.sol',
  'etherTransferInLoop.sol',
  'forLoopIteratesOverDynamicArray.sol'
]

let compilationResults: Record<string, CompilationResult> = {}

test('setup', function (t: test.Test) {
  solcOrg.loadRemoteVersion('v0.4.24+commit.e67f0147', (error, compiler) => {
    if (error) throw error

    testFiles.forEach((fileName) => {
      const content: string = readFileSync(join(__dirname, 'test-contracts/' + folder, fileName), 'utf8')
      // Latest AST is available under 'compileStandardWrapper' under solc for, 0.4.12 <= version < 0.5.0 
      compilationResults[fileName] = JSON.parse(compiler.compile(compilerInput(content)))
    })

    t.end()
  })
});

test('Integration test thisLocal module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.thisLocal
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of thisLocal warnings`)
  })
})

test('Integration test checksEffectsInteraction module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.checksEffectsInteraction
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of checksEffectsInteraction warnings`)
  })
})

test('Integration test constantFunctions module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.constantFunctions
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of constantFunctions warnings`)
  })
})

test('Integration test inlineAssembly module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.inlineAssembly
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of inlineAssembly warnings`)
  })
})

test('Integration test txOrigin module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.txOrigin
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of txOrigin warnings`)
  })
})

test('Integration test gasCosts module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.gasCosts
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 1,
    'blockLevelCompare.sol': 1,
    'intDivisionTruncate.sol': 1,
    'ERC20.sol': 2,
    'stringBytesLength.sol': 1,
    'etherTransferInLoop.sol': 3,
    'forLoopIteratesOverDynamicArray.sol': 2
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of gasCosts warnings`)
  })
})

test('Integration test similarVariableNames module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.similarVariableNames
  const lengthCheck: Record<string, number> = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 7,
    'ballot_reentrant.sol': 16,
    'ballot_withoutWarnings.sol': 0,
    'cross_contract.sol': 0,
    'inheritance.sol': 0,
    'modifier1.sol': 0,
    'modifier2.sol': 0,
    'notReentrant.sol': 4,
    'structReentrant.sol': 0,
    'thisLocal.sol': 0,
    'globals.sol': 0,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 2,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 2,
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of similarVariableNames warnings`)
  })
})

test('Integration test blockTimestamp module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.blockTimestamp
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of blockTimestamp warnings`)
  })
})

test('Integration test lowLevelCalls module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.lowLevelCalls
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of lowLevelCalls warnings`)
  })
})

test('Integration test blockBlockhash module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.blockBlockhash
  const lengthCheck: Record<string, number> = {
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
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 0,
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of blockBlockhash warnings`)
  })
})

test('Integration test noReturn module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.noReturn
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of noReturn warnings`)
  })
})

test('Integration test selfdestruct module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.selfdestruct
  const lengthCheck: Record<string, number> = {
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
    'globals.sol': 2,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 3,
    'deleteDynamicArray.sol': 0,
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'ERC20.sol': 0,
    'intDivisionTruncate.sol': 5,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of selfdestruct warnings`)
  })
})

test('Integration test guardConditions module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.guardConditions
  const lengthCheck: Record<string, number> = {
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
    'globals.sol': 1,
    'library.sol': 0,
    'transfer.sol': 0,
    'ctor.sol': 0,
    'forgottenReturn.sol': 0,
    'selfdestruct.sol': 0,
    'deleteDynamicArray.sol': 1,
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 1,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of guardConditions warnings`)
  })
})

test('Integration test deleteDynamicArrays module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.deleteDynamicArrays
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of deleteDynamicArrays warnings`)
  })
})

test('Integration test deleteFromDynamicArray module', function (t) {
  t.plan(testFiles.length)
  const module: any = modules.deleteFromDynamicArray
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 1,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of deleteFromDynamicArray warnings`)
  })
})

test('Integration test assignAndCompare module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.assignAndCompare
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 8,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of assignAndCompare warnings`)
  })
})

test('Integration test intDivisionTruncate module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.intDivisionTruncate
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 2,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of intDivisionTruncate warnings`)
  })
})

test('Integration test erc20Decimal module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.erc20Decimals
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 1,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of erc20Decimals warnings`)
  })
})

test('Integration test stringBytesLength module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.stringBytesLength
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 1,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of stringBytesLength warnings`)
  })
})

test('Integration test etherTransferInLoop module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.etherTransferInLoop
  const lengthCheck: Record<string, number> = {
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 3,
    'forLoopIteratesOverDynamicArray.sol': 0
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of etherTransferInLoop warnings`)
  })
})

test('Integration test forLoopIteratesOverDynamicArray module', function (t: test.Test) {
  t.plan(testFiles.length)
  const module: any = modules.forLoopIteratesOverDynamicArray
  const lengthCheck: Record<string, number> = {
    'KingOfTheEtherThrone.sol': 0,
    'assembly.sol': 0,
    'ballot.sol': 2,
    'ballot_reentrant.sol': 1,
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
    'deleteFromDynamicArray.sol': 0,
    'blockLevelCompare.sol': 0,
    'intDivisionTruncate.sol': 0,
    'ERC20.sol': 0,
    'stringBytesLength.sol': 0,
    'etherTransferInLoop.sol': 0,
    'forLoopIteratesOverDynamicArray.sol': 2
  }
  runModuleOnFiles(module, t, (file: string, report: AnalysisReportObj[]) => {
    t.equal(report.length, lengthCheck[file], `${file} has right amount of forLoopIteratesOverDynamicArray warnings`)
  })
})

// #################### Helpers
function runModuleOnFiles (Module: any, t: test.Test, cb: ((fname: string, report: AnalysisReportObj[]) => void)): void {
  const statRunner: StatRunner = new StatRunner()
  testFiles.forEach((fileName: string) => {
    const reports = statRunner.runWithModuleList(compilationResults[fileName], [{ name: new Module().name, mod: new Module() }])
    let report: AnalysisReportObj[] = reports[0].report
    if (report.some((x: AnalysisReportObj) => x.warning.includes('INTERNAL ERROR'))) {
      t.comment('Error while executing Module: ' + JSON.stringify(report))
    }
    cb(fileName, report)
  })      
}
