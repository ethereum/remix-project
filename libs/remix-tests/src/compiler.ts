import fs from './fileSystem'
import async from 'async'
import path from 'path'
import deepequal from 'deep-equal'
import Log from './logger'
import { Compiler as RemixCompiler } from '@remix-project/remix-solidity'
import { SrcIfc, CompilerConfiguration, CompilationErrors } from './types'
const logger = new Log()
const log = logger.logger

function regexIndexOf (inputString: string, regex: RegExp, startpos = 0) {
  const indexOf = inputString.substring(startpos).search(regex)
  return (indexOf >= 0) ? (indexOf + (startpos)) : indexOf
}

export function writeTestAccountsContract (accounts: string[]) {
  const testAccountContract = require('../sol/tests_accounts.sol') // eslint-disable-line
  let body = `address[${accounts.length}] memory accounts;`
  if (!accounts.length) body += ';'
  else {
    accounts.map((address, index) => {
      body += `\n\t\taccounts[${index}] = ${address};\n`
    })
  }
  return testAccountContract.replace('>accounts<', body)
}

/**
 * @dev Check if path includes name of a remix test file
 * @param path file path to check
 */

function isRemixTestFile (path: string) {
  return ['tests.sol', 'remix_tests.sol', 'remix_accounts.sol'].some(name => path.includes(name))
}

/**
 * @dev Process file to prepare sources object to be passed in solc compiler input
 *
 * See: https://solidity.readthedocs.io/en/latest/using-the-compiler.html#input-description
 *
 * @param filePath path of file to process
 * @param sources existing 'sources' object in which keys are the "global" names of the source files and
 *                value is object containing content of corresponding file with under key 'content'
 * @param isRoot True, If file is a root test contract file which is getting processed, not an imported file
 */

function processFile (filePath: string, sources: SrcIfc, isRoot = false) {
  const importRegEx = /import ['"](.+?)['"];/g
  const isFileAlreadyInSources: boolean = Object.keys(sources).includes(filePath)

  // Return if file is a remix test file or already processed
  if (isRemixTestFile(filePath) || isFileAlreadyInSources) { return }

  let content: string = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const testFileImportRegEx = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm

  // import 'remix_tests.sol', if file is a root test contract file and doesn't already have it
  if (isRoot && filePath.endsWith('_test.sol') && regexIndexOf(content, testFileImportRegEx) < 0) {
    const includeTestLibs = '\nimport \'remix_tests.sol\';\n'
    content = includeTestLibs.concat(content)
  }
  sources[filePath] = { content }
}

const userAgent = (typeof (navigator) !== 'undefined') && navigator.userAgent ? navigator.userAgent.toLowerCase() : '-'
const isBrowser = !(typeof (window) === 'undefined' || userAgent.indexOf(' electron/') > -1)

/**
 * @dev Compile file or files before running tests (used for CLI execution)
 * @param filename Name of file
 * @param isDirectory True, if path is a directory
 * @param opts Options
 * @param cb Callback
 *
 * TODO: replace this with remix's own compiler code
 */

export function compileFileOrFiles (filename: string, isDirectory: boolean, opts: any, compilerConfig: CompilerConfiguration, cb): void {
  let compiler: any
  const accounts: string[] = opts.accounts || []
  const sources: SrcIfc = {
    'tests.sol': { content: require('../sol/tests.sol') },
    'remix_tests.sol': { content: require('../sol/tests.sol') },
    'remix_accounts.sol': { content: writeTestAccountsContract(accounts) }
  }
  const filepath: string = (isDirectory ? filename : path.dirname(filename))
  try {
    if (!isDirectory && fs.existsSync(filename)) {
      if (filename.split('.').pop() === 'sol') {
        processFile(filename, sources, true)
      } else {
        throw new Error('Not a solidity file')
      }
    } else {
      // walkSync only if it is a directory
      let testFileCount = 0
      fs.walkSync(filepath, (foundpath: string) => {
        // only process .sol files
        if (foundpath.split('.').pop() === 'sol' && foundpath.endsWith('_test.sol')) {
          testFileCount++
          processFile(foundpath, sources, true)
        }
      })
      if (testFileCount > 0) {
        log.info(`${testFileCount} Solidity test file${testFileCount === 1 ? '' : 's'} found`)
      } else {
        log.error('No Solidity test file found. Make sure your test file ends with \'_test.sol\'')
        process.exit()
      }
    }
  } catch (e) { // eslint-disable-line no-useless-catch
    throw e
  } finally {
    async.waterfall([
      function loadCompiler (next) {
        compiler = new RemixCompiler((url, cb) => {
          try {
            cb(null, fs.readFileSync(url, 'utf-8'))
          } catch (e) {
            cb(e.message)
          }
        })
        if (compilerConfig) {
          const { currentCompilerUrl, evmVersion, optimize, runs } = compilerConfig
          if (evmVersion) compiler.set('evmVersion', evmVersion)
          if (optimize) compiler.set('optimize', optimize)
          if (runs) compiler.set('runs', runs)
          if (currentCompilerUrl) {
            compiler.loadRemoteVersion(currentCompilerUrl)
            compiler.event.register('compilerLoaded', this, function (version) {
              next()
            })
          } else {
            compiler.onInternalCompilerLoaded()
            next()
          }
        } else {
          compiler.onInternalCompilerLoaded()
          next()
        }
      },
      function doCompilation (next) {
        // @ts-ignore
        compiler.event.register('compilationFinished', this, (success, data, source, input, version) => {
          next(null, data)
        })
        compiler.compile(sources, filepath)
      }
    ], function (err: Error | null | undefined, result: any) {
      const error: Error[] = []
      if (result.error) error.push(result.error)
      const errors = (result.errors || error).filter((e) => e.type === 'Error' || e.severity === 'error')
      if (errors.length > 0) {
        if (!isBrowser) require('signale').fatal(errors) // eslint-disable-line
        return cb(new CompilationErrors(errors))
      }
      cb(err, result.contracts, result.sources) // return callback with contract details & ASTs
    })
  }
}

/**
 * @dev Compile contract source before running tests (used for IDE tests execution)
 * @param sources sources
 * @param compilerConfig current compiler configuration
 * @param importFileCb Import file callback
 * @param opts Options
 * @param cb Callback
 */
export function compileContractSources (sources: SrcIfc, newCompConfig: any, importFileCb, UTRunner, opts: any, cb): void {
  let compiler
  const filepath = opts.testFilePath || ''
  const testFileImportRegEx = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm

  const includeTestLibs = '\nimport \'remix_tests.sol\';\n'
  for (const file in sources) {
    const c: string = sources[file].content
    if (file.endsWith('_test.sol') && c && regexIndexOf(c, testFileImportRegEx) < 0) {
      sources[file].content = includeTestLibs.concat(c)
    }
  }

  async.waterfall([
    (next) => {
      if (!compiler || !deepequal(UTRunner.compilerConfig, newCompConfig)) {
        UTRunner.compilerConfig = newCompConfig
        const { currentCompilerUrl, evmVersion, optimize, runs, usingWorker } = newCompConfig
        compiler = new RemixCompiler(importFileCb)
        compiler.set('evmVersion', evmVersion)
        compiler.set('optimize', optimize)
        compiler.set('runs', runs)
        compiler.loadVersion(usingWorker, currentCompilerUrl)
        // @ts-ignore
        compiler.event.register('compilerLoaded', this, (version) => {
          next()
        })
      } else {
        compiler = UTRunner.compiler
        next()
      }
    },
    (next) => {
      const compilationFinishedCb = (success, data, source, input, version) => {
        // data.error usually exists for exceptions like worker error etc.
        if (!data.error) UTRunner.compiler = compiler
        if (opts && opts.event) opts.event.emit('compilationFinished', success, data, source, input, version)
        next(null, data)
      }
      compiler.event.unregister('compilationFinished', compilationFinishedCb)
      // @ts-ignore
      compiler.event.register('compilationFinished', compilationFinishedCb)
      compiler.compile(sources, filepath)
    }
  ], function (err: Error | null | undefined, result: any) {
    const error: Error[] = []
    if (result.error) error.push(result.error)
    const errors = (result.errors || error).filter((e) => e.type === 'Error' || e.severity === 'error')
    if (errors.length > 0) {
      if (!isBrowser) require('signale').fatal(errors) // eslint-disable-line
      return cb(new CompilationErrors(errors))
    }
    cb(err, result.contracts, result.sources) // return callback with contract details & ASTs
  })
}
