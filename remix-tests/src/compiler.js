let fs = require('fs')
var async = require('async')
var path = require('path')

let RemixCompiler = require('remix-solidity').Compiler

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
    sources[file] = {content: fs.readFileSync(path.join(filepath, file)).toString()}
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
      console.dir(errors)
      return cb(new Error('errors compiling'))
    }
    cb(err, result.contracts)
  })
}

function compileContractSources (sources, importFileCb, cb) {
  let compiler, filepath

  if (!sources['remix_tests.sol']) {
    sources['remix_tests.sol'] = {content: require('../sol/tests.sol.js')}
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
      console.dir(errors)
      return cb(new Error('errors compiling'))
    }
    cb(err, result.contracts)
  })
}

module.exports = {
  compileFileOrFiles: compileFileOrFiles,
  compileContractSources: compileContractSources
}
