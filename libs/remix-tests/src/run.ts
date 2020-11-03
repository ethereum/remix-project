import commander from 'commander'
import Web3 from 'web3';
import path from 'path'
import { runTestFiles } from './runTestFiles'
import fs from './fileSystem'
import { Provider } from '@remix-project/remix-simulator'
import { CompilerConfiguration } from './types'
import Log from './logger'
const logger = new Log()
const log = logger.logger
import colors from 'colors'

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
                'true': true,
                'false': false
        }
        return optimize[v];
}

const version = require('../package.json').version

commander.version(version)

commander.command('version').description('output the version number').action(function () {
    console.log(version)
})

commander.command('help').description('output usage information').action(function () {
    commander.help()
})

// get current version
commander
    .option('-v, --verbose <level>', 'run with verbosity', mapVerbosity)
    .option('-o, --optimize <bool>', 'run compiler optimization', mapOptimize)
    .action(async (testsPath) => {

        // Check if path exists
        if (!fs.existsSync(testsPath)) {
            log.error(testsPath + ' not found')
            process.exit(1)
        }

        // Check if path is for a directory
        const isDirectory = fs.lstatSync(testsPath).isDirectory()

        // If path is for a file, file name must have `_test.sol` suffix
        if(!isDirectory && !testsPath.endsWith('_test.sol')) {
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

        const web3 = new Web3()
        const provider: any = new Provider()
        await provider.init()
        web3.setProvider(provider)

        const compilerConfig = {} as CompilerConfiguration
        if (commander.optimize) {
                compilerConfig.optimize = commander.optimize
                log.info('compiler optimization set to ' + compilerConfig.optimize)
        }

        runTestFiles(path.resolve(testsPath), isDirectory, web3, compilerConfig)
    })

if (!process.argv.slice(2).length) {
    log.error('Please specify a file or directory path')
    process.exit()
}

commander.parse(process.argv)
