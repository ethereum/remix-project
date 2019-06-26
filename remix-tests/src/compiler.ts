import fs from './fileSystem'
import async from 'async'
import path from 'path'
let RemixCompiler = require('remix-solidity').Compiler
import { SrcIfc } from './types'

function regexIndexOf (inputString: string, regex: RegExp, startpos: number = 0) {
    const indexOf = inputString.substring(startpos).search(regex)
    return (indexOf >= 0) ? (indexOf + (startpos)) : indexOf
}

function writeTestAccountsContract (accounts: string[]) {
    const testAccountContract = require('../sol/tests_accounts.sol.js')
    let body = `address[${accounts.length}] memory accounts;`
    if (!accounts.length) body += ';'
    else {
        accounts.map((address, index) => {
            body += `\naccounts[${index}] = ${address};\n`
        })
    }
    return testAccountContract.replace('>accounts<', body)
}

const userAgent = (typeof (navigator) !== 'undefined') && navigator.userAgent ? navigator.userAgent.toLowerCase() : '-'
const isBrowser = !(typeof (window) === 'undefined' || userAgent.indexOf(' electron/') > -1)

// TODO: replace this with remix's own compiler code
export function compileFileOrFiles(filename: string, isDirectory: boolean, opts: any, cb: Function) {
    let compiler: any
    let accounts = opts.accounts || []
    const sources = {
        'tests.sol': { content: require('../sol/tests.sol.js') },
        'remix_tests.sol': { content: require('../sol/tests.sol.js') },
        'remix_accounts.sol': { content: writeTestAccountsContract(accounts) }
    }
    const filepath = (isDirectory ? filename : path.dirname(filename))
    // TODO: for now assumes filepath dir contains all tests, later all this
    // should be replaced with remix's & browser solidity compiler code

    // This logic is wrong
    // We should only look into current file if a full file name with path is given
    // We should only walk through directory if a directory name is passed
    try {
        // walkSync only if it is a directory
        fs.walkSync(filepath, (foundpath: string) => {
            // only process .sol files
            if (foundpath.split('.').pop() === 'sol') {
                let c = fs.readFileSync(foundpath).toString()
                const s = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm
                let includeTestLibs = '\nimport \'remix_tests.sol\';\n'
                if (foundpath.indexOf('_test.sol') > 0 && regexIndexOf(c, s) < 0) {
                    c = includeTestLibs.concat(c)
                }
                sources[foundpath] = { content: c }
            }
        })
    } catch (e) {
        throw e
    } finally {
        async.waterfall([
            function loadCompiler(next: Function) {
                compiler = new RemixCompiler()
                compiler.onInternalCompilerLoaded()
                // compiler.event.register('compilerLoaded', this, function (version) {
                next()
                // });
            },
            function doCompilation(next: Function) {
                // @ts-ignore
                compiler.event.register('compilationFinished', this, (success, data, source) => {
                    next(null, data)
                })
                compiler.compile(sources, filepath)
            }
        ], function (err: Error | null | undefined, result: any) {
            let errors = (result.errors || []).filter((e) => e.type === 'Error' || e.severity === 'error')
            if (errors.length > 0) {
                if (!isBrowser) require('signale').fatal(errors)
                return cb(new Error('errors compiling'))
            }
            cb(err, result.contracts)
        })
    }
}

export function compileContractSources(sources: SrcIfc, importFileCb: any, opts: any, cb: Function) {
    let compiler, filepath: string
    let accounts = opts.accounts || []
    // Iterate over sources keys. Inject test libraries. Inject test library import statements.
    if (!('remix_tests.sol' in sources) && !('tests.sol' in sources)) {
        sources['remix_tests.sol'] = { content: require('../sol/tests.sol.js') }
        sources['remix_accounts.sol'] = { content: writeTestAccountsContract(accounts) }
    }
    const s = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm
    let includeTestLibs = '\nimport \'remix_tests.sol\';\n'
    for (let file in sources) {
        const c = sources[file].content
        if (file.indexOf('_test.sol') > 0 && c && regexIndexOf(c, s) < 0) {
            sources[file].content = includeTestLibs.concat(c)
        }
    }

    async.waterfall([
        function loadCompiler (next: Function) {
            compiler = new RemixCompiler(importFileCb)
            compiler.onInternalCompilerLoaded()
            // compiler.event.register('compilerLoaded', this, function (version) {
            next()
            // });
        },
        function doCompilation (next: Function) {
            // @ts-ignore
            compiler.event.register('compilationFinished', this, (success, data, source) => {
                next(null, data)
            })
            compiler.compile(sources, filepath)
        }
    ], function (err: Error | null | undefined , result: any) {
        let error: Error[] = []
        if (result.error) error.push(result.error)
        let errors = (result.errors || error).filter((e) => e.type === 'Error' || e.severity === 'error')
        if (errors.length > 0) {
            if (!isBrowser) require('signale').fatal(errors)
            return cb(new Error('errors compiling'))
        }
        cb(err, result.contracts)
    })
}
