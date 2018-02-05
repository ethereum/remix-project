let fs = require('fs')
var async = require('async')
var path = require('path')

let RemixCompiler = require('remix-solidity').Compiler

// TODO: replace this with remix's own compiler code

function compileFileOrFiles (filename, isDirectory, cb) {
  let compiler, filepath

  const sources = {
    'tests.sol': {content: fs.readFileSync('sol/tests.sol').toString()}
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
    let errors = result.errors.filter((e) => e.type === 'Error');
    if (errors.length > 0) {
      console.dir(errors);
      return cb("errors compiling");
    }
    cb(err, result.contracts)
  })
}

module.exports = {
  compileFileOrFiles: compileFileOrFiles
}
