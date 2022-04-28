import async from 'async'
import fs from './fileSystem'
import { runTest } from './testRunner'
import { TestResultInterface, ResultsInterface, CompilerConfiguration, compilationInterface, ASTInterface, Options, AstNode } from './types'
import colors from 'colors'
import Web3 from 'web3'

import { compileFileOrFiles } from './compiler'
import { deployAll } from './deployer'

/**
 * @dev run test contract files (used for CLI)
 * @param filepath Path of file
 * @param isDirectory True, if path is a directory
 * @param web3 Web3
 * @param finalCallback optional callback to run finally
 * @param opts Options
 */

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function runTestFiles (filepath: string, isDirectory: boolean, web3: Web3, compilerConfig: CompilerConfiguration, finalCallback: any = () => {}, opts?: Options) {
  opts = opts || {}
  compilerConfig = compilerConfig || {} as CompilerConfiguration
  const sourceASTs: any = {}
  const { Signale } = require('signale') // eslint-disable-line
  // signale configuration
  const options = {
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
  }
  const signale = new Signale(options)
  let accounts = opts['accounts'] || null
  async.waterfall([
    function getAccountList (next) {
      if (accounts) return next(null)
      web3.eth.getAccounts((_err: Error | null | undefined, _accounts) => {
        accounts = _accounts
        next(null)
      })
    },
    function compile (next) {
      compileFileOrFiles(filepath, isDirectory, { accounts }, compilerConfig, next)
    },
    function deployAllContracts (compilationResult: compilationInterface, asts: ASTInterface, next) {
      // Extract AST of test contract file source
      for (const filename in asts) {
        if (filename.endsWith('_test.sol')) { sourceASTs[filename] = asts[filename].ast }
      }
      deployAll(compilationResult, web3, accounts, false, null, (err, contracts) => {
        if (err) {
          // If contract deployment fails because of 'Out of Gas' error, try again with double gas
          // This is temporary, should be removed when remix-tests will have a dedicated UI to
          // accept deployment params from UI
          if (err.message.includes('The contract code couldn\'t be stored, please check your gas limit')) {
            deployAll(compilationResult, web3, accounts, true, null, (error, contracts) => {
              if (error) next([{ message: 'contract deployment failed after trying twice: ' + error.message, severity: 'error' }]) // IDE expects errors in array
              else next(null, compilationResult, contracts)
            })
          } else { next([{ message: 'contract deployment failed: ' + err.message, severity: 'error' }]) } // IDE expects errors in array
        } else { next(null, compilationResult, contracts) }
      })
    },
    function determineTestContractsToRun (compilationResult: compilationInterface, contracts: any, next) {
      const contractsToTest: string[] = []
      const contractsToTestDetails: any[] = []
      const gatherContractsFrom = function (filename: string) {
        if (!filename.endsWith('_test.sol')) {
          return
        }
        try {
          Object.keys(compilationResult[filename]).forEach(contractName => {
            contractsToTest.push(contractName)
            contractsToTestDetails.push(compilationResult[filename][contractName])
          })
        } catch (e) {
          console.error(e)
        }
      }
      if (isDirectory) {
        fs.walkSync(filepath, (foundpath: string) => {
          gatherContractsFrom(foundpath)
        })
      } else {
        gatherContractsFrom(filepath)
      }
      next(null, contractsToTest, contractsToTestDetails, contracts)
    },
    function runTests (contractsToTest: string[], contractsToTestDetails: any[], contracts: any, next) {
      let totalPassing = 0
      let totalFailing = 0
      let totalTime = 0
      const errors: any[] = []

      const _testCallback = function (err: Error | null | undefined, result: TestResultInterface) {
        if (err) throw err
        if (result.type === 'contract') {
          signale.name(result.value.white)
        } else if (result.type === 'testPass') {
          signale.result(result.value)
        } else if (result.type === 'testFailure') {
          signale.error(result.value.red)
          errors.push(result)
        }
      }
      const _resultsCallback = (_err: Error | null | undefined, result: ResultsInterface, cb) => {
        totalPassing += result.passingNum
        totalFailing += result.failureNum
        totalTime += result.timePassed
        cb()
      }

      async.eachOfLimit(contractsToTest, 1, (contractName: string, index, cb) => {
        try {
          const fileAST: AstNode = sourceASTs[contracts[contractName]['filename']]
          runTest(contractName, contracts[contractName], contractsToTestDetails[index], fileAST, { accounts }, _testCallback, (err, result) => {
            if (err) {
              console.log(err)
              return cb(err)
            }
            _resultsCallback(null, result, cb)
          })
        } catch (e) {
          console.error(e)
        }
      }, function (err) {
        if (err) {
          return next(err)
        }

        console.log('\n')
        if (totalPassing > 0) {
          console.log(colors.green(totalPassing + ' passing ') + colors.grey('(' + totalTime + 's)'))
        }
        if (totalFailing > 0) {
          console.log(colors.red(totalFailing + ' failing'))
        }
        console.log('')

        errors.forEach((error, index) => {
          console.log('  ' + (index + 1) + ') ' + colors.bold(error.context + ': ') + error.value)
          console.log('')
          console.log(colors.red('\t error: ' + error.errMsg))
          console.log(colors.green('\t expected value to be ' + error.assertMethod + ' to: ' + error.expected))
          console.log(colors.red('\t returned: ' + error.returned))
        })
        console.log('')

        next()
      })
    }
  ], finalCallback)
}
