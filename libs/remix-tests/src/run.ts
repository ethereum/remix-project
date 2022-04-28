import commander from 'commander'
import Web3 from 'web3'
import path from 'path'
import axios, { AxiosResponse } from 'axios'
import { runTestFiles } from './runTestFiles'
import fs from './fileSystem'
import { Provider } from '@remix-project/remix-simulator'
import { CompilerConfiguration } from './types'
import Log from './logger'
import colors from 'colors'
const logger = new Log()
const log = logger.logger

// parse verbosity
function mapVerbosity (v: number) {
  const levels = {
    0: 'error',
    1: 'warn',
    2: 'info',
    3: 'verbose',
    4: 'debug',
    5: 'silly'
  }
  return levels[v]
}

function mapOptimize (v: string) {
  const optimize = {
    true: true,
    false: false
  }
  return optimize[v]
}

const version = require('../package.json').version // eslint-disable-line

commander.version(version)

commander.command('version').description('output the version number').action(function () {
  console.log(version)
})

commander.command('help').description('output usage information').action(function () {
  commander.help()
})

// get current version
commander
  .option('-c, --compiler <string>', 'set compiler version (e.g: 0.6.1, 0.7.1 etc)')
  .option('-e, --evm <string>', 'set EVM version (e.g: petersburg, istanbul etc)')
  .option('-o, --optimize <bool>', 'enable/disable optimization', mapOptimize)
  .option('-r, --runs <number>', 'set runs (e.g: 150, 250 etc)')
  .option('-v, --verbose <level>', 'set verbosity level (0 to 5)', mapVerbosity)
  .action(async (testsPath) => {
    // Check if path exists
    if (!fs.existsSync(testsPath)) {
      log.error(testsPath + ' not found')
      process.exit(1)
    }

    // Check if path is for a directory
    const isDirectory = fs.lstatSync(testsPath).isDirectory()

    // If path is for a file, file name must have `_test.sol` suffix
    if (!isDirectory && !testsPath.endsWith('_test.sol')) {
      log.error('Test filename should end with "_test.sol"')
      process.exit()
    }

    // Console message
    console.log(colors.white('\n\t👁\t:: Running remix-tests - Unit testing for solidity ::\t👁\n'))

    // Set logger verbosity
    if (commander.verbose) {
      logger.setVerbosity(commander.verbose)
      log.info('verbosity level set to ' + commander.verbose.blue)
    }

    const compilerConfig = {} as CompilerConfiguration
    if (commander.compiler) {
      const compVersion = commander.compiler
      const baseURL = 'https://binaries.soliditylang.org/wasm/'
      const response: AxiosResponse = await axios.get(baseURL + 'list.json')
      const { releases, latestRelease } = response.data as { releases: string[], latestRelease: string }
      const compString = releases ? releases[compVersion] : null
      if (!compString) {
        log.error(`No compiler found in releases with version ${compVersion}`)
        process.exit()
      } else {
        compilerConfig.currentCompilerUrl = compString.replace('soljson-', '').replace('.js', '')
        log.info(`Compiler version set to ${compVersion}. Latest version is ${latestRelease}`)
      }
    }

    if (commander.evm) {
      compilerConfig.evmVersion = commander.evm
      log.info(`EVM set to ${compilerConfig.evmVersion}`)
    }

    if (commander.optimize) {
      compilerConfig.optimize = commander.optimize
      log.info(`Optimization is ${compilerConfig.optimize ? 'enabled' : 'disabled'}`)
    }

    if (commander.runs) {
      if (!commander.optimize) {
        log.error('Optimization should be enabled for runs')
        process.exit()
      }
      compilerConfig.runs = commander.runs
      log.info(`Runs set to ${compilerConfig.runs}`)
    }

    const web3 = new Web3()
    const provider: any = new Provider()
    await provider.init()
    web3.setProvider(provider)

    runTestFiles(path.resolve(testsPath), isDirectory, web3, compilerConfig)
  })

if (!process.argv.slice(2).length) {
  log.error('Please specify a file or directory path')
  process.exit()
}

commander.parse(process.argv)
