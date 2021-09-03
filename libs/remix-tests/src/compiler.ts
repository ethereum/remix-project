<<<<<<< HEAD
/* eslint-disable handle-callback-err */
import fs from './fileSystem'
import async from 'async'
import path from 'path'
import Log from './logger'
import { Compiler as RemixCompiler } from '@remix-project/remix-solidity'
import { SrcIfc, CompilerConfiguration, CompilationErrors } from './types'
const logger = new Log()
const log = logger.logger

function regexIndexOf (inputString: string, regex: RegExp, startpos = 0) {
  const indexOf = inputString.substring(startpos).search(regex)
  return indexOf >= 0 ? indexOf + startpos : indexOf
=======
import fs from './fileSystem';
import async from 'async';
import path from 'path';
import Log from './logger';
import { Compiler as RemixCompiler } from '@remix-project/remix-solidity';
import { SrcIfc, CompilerConfiguration, CompilationErrors } from './types';
const logger = new Log();
const log = logger.logger;

function regexIndexOf(inputString: string, regex: RegExp, startpos = 0) {
  const indexOf = inputString.substring(startpos).search(regex);
  return indexOf >= 0 ? indexOf + startpos : indexOf;
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
}

function writeTestAccountsContract(accounts: string[]) {
  const testAccountContract = require('../sol/tests_accounts.sol');
  let body = `address[${accounts.length}] memory accounts;`;
  if (!accounts.length) body += ';';
  else {
    accounts.map((address, index) => {
      body += `\naccounts[${index}] = ${address};\n`;
    });
  }
  return testAccountContract.replace('>accounts<', body);
}

/**
 * @dev Check if path includes name of a remix test file
 * @param path file path to check
 */

<<<<<<< HEAD
function isRemixTestFile (path: string) {
  return ['tests.sol', 'remix_tests.sol', 'remix_accounts.sol'].some(name =>
    path.includes(name)
  )
=======
function isRemixTestFile(path: string) {
  return ['tests.sol', 'remix_tests.sol', 'remix_accounts.sol'].some(name =>
    path.includes(name)
  );
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
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

<<<<<<< HEAD
function processFile (filePath: string, sources: SrcIfc, isRoot = false) {
  const importRegEx = /import ['"](.+?)['"];/g
  let group: RegExpExecArray | null = null
  const isFileAlreadyInSources: boolean = Object.keys(sources).includes(
    filePath
  )

  // Return if file is a remix test file or already processed
  if (isRemixTestFile(filePath) || isFileAlreadyInSources) {
    return
=======
function processFile(filePath: string, sources: SrcIfc, isRoot = false) {
  const importRegEx = /import ['"](.+?)['"];/g;
  let group: RegExpExecArray | null = null;
  const isFileAlreadyInSources: boolean = Object.keys(sources).includes(
    filePath
  );

  // Return if file is a remix test file or already processed
  if (isRemixTestFile(filePath) || isFileAlreadyInSources) {
    return;
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
  }

  let content: string = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const testFileImportRegEx = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm;

  // import 'remix_tests.sol', if file is a root test contract file and doesn't already have it
  if (
    isRoot &&
    filePath.endsWith('_test.sol') &&
    regexIndexOf(content, testFileImportRegEx) < 0
  ) {
<<<<<<< HEAD
    const includeTestLibs = "\nimport 'remix_tests.sol';\n"
    content = includeTestLibs.concat(content)
=======
    const includeTestLibs = "\nimport 'remix_tests.sol';\n";
    content = includeTestLibs.concat(content);
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
  }
  sources[filePath] = { content };
  importRegEx.exec(''); // Resetting state of RegEx

  // Process each 'import' in file content
  while ((group = importRegEx.exec(content))) {
<<<<<<< HEAD
    const importedFile: string = group[1]
    const importedFilePath: string = path.join(
      path.dirname(filePath),
      importedFile
    )
    processFile(importedFilePath, sources)
=======
    const importedFile: string = group[1];
    const importedFilePath: string = path.join(
      path.dirname(filePath),
      importedFile
    );
    processFile(importedFilePath, sources);
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
  }
}

const userAgent =
  typeof navigator !== 'undefined' && navigator.userAgent
    ? navigator.userAgent.toLowerCase()
<<<<<<< HEAD
    : '-'
const isBrowser = !(
  typeof window === 'undefined' || userAgent.indexOf(' electron/') > -1
)
=======
    : '-';
const isBrowser = !(
  typeof window === 'undefined' || userAgent.indexOf(' electron/') > -1
);
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)

/**
 * @dev Compile file or files before running tests (used for CLI execution)
 * @param filename Name of file
 * @param isDirectory True, if path is a directory
 * @param opts Options
 * @param cb Callback
 *
 * TODO: replace this with remix's own compiler code
 */

<<<<<<< HEAD
export function compileFileOrFiles (
=======
export function compileFileOrFiles(
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
  filename: string,
  isDirectory: boolean,
  opts: any,
  compilerConfig: CompilerConfiguration,
  cb
): void {
<<<<<<< HEAD
  let compiler: any
  const accounts: string[] = opts.accounts || []
=======
  let compiler: any;
  const accounts: string[] = opts.accounts || [];
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
  const sources: SrcIfc = {
    'tests.sol': { content: require('../sol/tests.sol') },
    'remix_tests.sol': { content: require('../sol/tests.sol') },
    'remix_accounts.sol': { content: writeTestAccountsContract(accounts) }
<<<<<<< HEAD
  }
  const filepath: string = isDirectory ? filename : path.dirname(filename)
=======
  };
  const filepath: string = isDirectory ? filename : path.dirname(filename);
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
  try {
    if (!isDirectory && fs.existsSync(filename)) {
      if (filename.split('.').pop() === 'sol') {
        processFile(filename, sources, true);
      } else {
        throw new Error('Not a solidity file');
      }
    } else {
      // walkSync only if it is a directory
      let testFileCount = 0;
      fs.walkSync(filepath, (foundpath: string) => {
        // only process .sol files
        if (
          foundpath.split('.').pop() === 'sol' &&
          foundpath.endsWith('_test.sol')
        ) {
<<<<<<< HEAD
          testFileCount++
          processFile(foundpath, sources, true)
=======
          testFileCount++;
          processFile(foundpath, sources, true);
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
        }
      });
      if (testFileCount > 0) {
        log.info(
          `${testFileCount} Solidity test file${
            testFileCount === 1 ? '' : 's'
          } found`
<<<<<<< HEAD
        )
      } else {
        log.error(
          "No Solidity test file found. Make sure your test file ends with '_test.sol'"
        )
        process.exit()
      }
    }
  // eslint-disable-next-line no-useless-catch
  } catch (e) {
    // eslint-disable-line no-useless-catch
    throw e
  } finally {
    async.waterfall(
      [
        function loadCompiler (next) {
          compiler = new RemixCompiler()
=======
        );
      } else {
        log.error(
          "No Solidity test file found. Make sure your test file ends with '_test.sol'"
        );
        process.exit();
      }
    }
  } catch (e) {
    // eslint-disable-line no-useless-catch
    throw e;
  } finally {
    async.waterfall(
      [
        function loadCompiler(next) {
          compiler = new RemixCompiler();
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
          if (compilerConfig) {
            const {
              currentCompilerUrl,
              evmVersion,
              optimize,
              runs
<<<<<<< HEAD
            } = compilerConfig
            if (evmVersion) compiler.set('evmVersion', evmVersion)
            if (optimize) compiler.set('optimize', optimize)
            if (runs) compiler.set('runs', runs)
            if (currentCompilerUrl) {
              compiler.loadRemoteVersion(currentCompilerUrl)
              compiler.event.register('compilerLoaded', this, function (
                version
              ) {
                next()
              })
            } else {
              compiler.onInternalCompilerLoaded()
              next()
=======
            } = compilerConfig;
            if (evmVersion) compiler.set('evmVersion', evmVersion);
            if (optimize) compiler.set('optimize', optimize);
            if (runs) compiler.set('runs', runs);
            if (currentCompilerUrl) {
              compiler.loadRemoteVersion(currentCompilerUrl);
              compiler.event.register('compilerLoaded', this, function(
                version
              ) {
                next();
              });
            } else {
              compiler.onInternalCompilerLoaded();
              next();
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
            }
          } else {
            compiler.onInternalCompilerLoaded();
            next();
          }
        },
<<<<<<< HEAD
        function doCompilation (next) {
=======
        function doCompilation(next) {
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
          // @ts-ignore
          compiler.event.register(
            'compilationFinished',
            this,
            (success, data, source) => {
<<<<<<< HEAD
              next(null, data)
            }
          )
          compiler.compile(sources, filepath)
        }
      ],
      function (err: Error | null | undefined, result: any) {
        const error: Error[] = []
        if (result.error) error.push(result.error)
        const errors = (result.errors || error).filter(
          e => e.type === 'Error' || e.severity === 'error'
        )
        if (errors.length > 0) {
          if (!isBrowser) require('signale').fatal(errors)
          return cb(new CompilationErrors(errors))
        }
        cb(err, result.contracts, result.sources) // return callback with contract details & ASTs
      }
    )
=======
              next(null, data);
            }
          );
          compiler.compile(sources, filepath);
        }
      ],
      function(err: Error | null | undefined, result: any) {
        const error: Error[] = [];
        if (result.error) error.push(result.error);
        const errors = (result.errors || error).filter(
          e => e.type === 'Error' || e.severity === 'error'
        );
        if (errors.length > 0) {
          if (!isBrowser) require('signale').fatal(errors);
          return cb(new CompilationErrors(errors));
        }
        cb(err, result.contracts, result.sources); // return callback with contract details & ASTs
      }
    );
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
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
<<<<<<< HEAD
export function compileContractSources (
=======
export function compileContractSources(
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
  sources: SrcIfc,
  compilerConfig: CompilerConfiguration,
  importFileCb: any,
  opts: any,
  cb
): void {
<<<<<<< HEAD
  let compiler, filepath: string
  const accounts: string[] = opts.accounts || []
  // Iterate over sources keys. Inject test libraries. Inject test library import statements.
  if (!('remix_tests.sol' in sources) && !('tests.sol' in sources)) {
    sources['tests.sol'] = { content: require('../sol/tests.sol.js') }
    sources['remix_tests.sol'] = { content: require('../sol/tests.sol.js') }
    sources['remix_accounts.sol'] = {
      content: writeTestAccountsContract(accounts)
    }
=======
  let compiler, filepath: string;
  const accounts: string[] = opts.accounts || [];
  // Iterate over sources keys. Inject test libraries. Inject test library import statements.
  if (!('remix_tests.sol' in sources) && !('tests.sol' in sources)) {
    sources['tests.sol'] = { content: require('../sol/tests.sol.js') };
    sources['remix_tests.sol'] = { content: require('../sol/tests.sol.js') };
    sources['remix_accounts.sol'] = {
      content: writeTestAccountsContract(accounts)
    };
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
  }
  const testFileImportRegEx = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm;

<<<<<<< HEAD
  const includeTestLibs = "\nimport 'remix_tests.sol';\n"
  for (const file in sources) {
    const c: string = sources[file].content
=======
  const includeTestLibs = "\nimport 'remix_tests.sol';\n";
  for (const file in sources) {
    const c: string = sources[file].content;
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
    if (
      file.endsWith('_test.sol') &&
      c &&
      regexIndexOf(c, testFileImportRegEx) < 0
    ) {
<<<<<<< HEAD
      sources[file].content = includeTestLibs.concat(c)
=======
      sources[file].content = includeTestLibs.concat(c);
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
    }
  }

  async.waterfall(
    [
      function loadCompiler(next) {
        const {
          currentCompilerUrl,
          evmVersion,
          optimize,
          runs,
          usingWorker
        } = compilerConfig;
        compiler = new RemixCompiler(importFileCb);
        compiler.set('evmVersion', evmVersion);
        compiler.set('optimize', optimize);
        compiler.set('runs', runs);
        compiler.loadVersion(usingWorker, currentCompilerUrl);
        // @ts-ignore
        compiler.event.register('compilerLoaded', this, version => {
          next();
        });
      },
      function doCompilation(next) {
        // @ts-ignore
        compiler.event.register(
          'compilationFinished',
          this,
          (success, data, source) => {
            if (opts && opts.event)
              opts.event.trigger('compilationFinished', [
                success,
                data,
                source
              ]);
            next(null, data);
          }
        );
        compiler.compile(sources, filepath);
      }
    ],
    function(err: Error | null | undefined, result: any) {
      const error: Error[] = [];
      if (result.error) error.push(result.error);
      const errors = (result.errors || error).filter(
        e => e.type === 'Error' || e.severity === 'error'
      );
      if (errors.length > 0) {
        if (!isBrowser) require('signale').fatal(errors);
        return cb(new CompilationErrors(errors));
      }
      cb(err, result.contracts, result.sources); // return callback with contract details & ASTs
    }
<<<<<<< HEAD
  })
=======
  );
>>>>>>> ccf5baeae (save compiler artifacts to show data on debugging)
}
