/* eslint no-extend-native: "warn" */
let fs = require('fs')
var async = require('async')
var path = require('path')
let RemixCompiler = require('remix-solidity').Compiler

String.prototype.regexIndexOf = function (regex, startpos) {
  var indexOf = this.substring(startpos || 0).search(regex)
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf
}

var userAgent = (typeof (navigator) !== 'undefined') && navigator.userAgent ? navigator.userAgent.toLowerCase() : '-'
var isBrowser = !(typeof (window) === 'undefined' || userAgent.indexOf(' electron/') > -1)

// TODO: replace this with remix's own compiler code
function compileFileOrFiles (filename, isDirectory, cb) {
  let compiler, filepath

  const sources = {
    'tests.sol': { content: require('../sol/tests.sol.js') },
    'remix_tests.sol': { content: require('../sol/tests.sol.js') }
  }

  // TODO: for now assumes filepath dir contains all tests, later all this
  // should be replaced with remix's & browser solidity compiler code
  filepath = (isDirectory ? filename : path.dirname(filename))

  fs.readdirSync(filepath).forEach(file => {
    // only process .sol files
    if (file.split('.').pop() === 'sol') {
      let c = fs.readFileSync(path.join(filepath, file)).toString()
      const s = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm
      if (file.indexOf('_test.sol') > 0 && c.regexIndexOf(s) < 0) {
        c = c.replace(/(pragma solidity \^\d+\.\d+\.\d+;)/, '$1\nimport \'remix_tests.sol\';')
      }
      sources[file] = { content: c }
    }
  })

  async.waterfall([
    function loadCompiler (next) {
      compiler = new RemixCompiler()
      compiler.onInternalCompilerLoaded()
      // compiler.event.register('compilerLoaded', this, function (version) {
      next()
      // });
    },
    function doCompilation (next) {
      compiler.event.register('compilationFinished', this, function (success, data, source) {
        next(null, data)
      })
      compiler.compile(sources, filepath)
    }
  ], function (err, result) {
    let errors = (result.errors || []).filter((e) => e.type === 'Error' || e.severity === 'error')
    if (errors.length > 0) {
      if (!isBrowser) require('signale').fatal(errors)
      return cb(new Error('errors compiling'))
    }
    cb(err, result.contracts)
  })
}

function compileContractSources (sources, importFileCb, cb) {
  let compiler, filepath

  // Iterate over sources keys. Inject test libraries. Inject test library import statements.
  if (!('remix_tests.sol' in sources) && !('tests.sol' in sources)) {
    sources['remix_tests.sol'] = { content: require('../sol/tests.sol.js') }
  }
  const s = /^(import)\s['"](remix_tests.sol|tests.sol)['"];/gm
  for (let file in sources) {
    const c = sources[file].content
    if (file.indexOf('_test.sol') > 0 && c && c.regexIndexOf(s) < 0) {
      sources[file].content = c.replace(/(pragma solidity \^\d+\.\d+\.\d+;)/, '$1\nimport \'remix_tests.sol\';')
    }
  }

  async.waterfall([
    function loadCompiler (next) {
      compiler = new RemixCompiler(importFileCb)
      compiler.onInternalCompilerLoaded()
      // compiler.event.register('compilerLoaded', this, function (version) {
      next()
      // });
    },
    function doCompilation (next) {
      compiler.event.register('compilationFinished', this, function (success, data, source) {
        next(null, data)
      })
      compiler.compile(sources, filepath)
    }
  ], function (err, result) {
    let errors = (result.errors || []).filter((e) => e.type === 'Error' || e.severity === 'error')
    if (errors.length > 0) {
      if (!isBrowser) require('signale').fatal(errors)
      return cb(new Error('errors compiling'))
    }
    cb(err, result.contracts)
  })
}

module.exports = {
  compileFileOrFiles: compileFileOrFiles,
  compileContractSources: compileContractSources
}
