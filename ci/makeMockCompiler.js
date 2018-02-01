'use strict'

var fs = require('fs')
var compiler = require('solc')

var compilerInput = require('remix-solidity').CompilerInput
var compilationResult = {}
gatherCompilationResults('./test-browser/tests/', compilationResult)
gatherCompilationResults('./test-browser/tests/units/', compilationResult)
replaceSolCompiler(compilationResult)

function gatherCompilationResults (dir, compilationResult, callback) {
  var filenames = fs.readdirSync(dir, 'utf8')
  filenames.map(function (item, i) {
    if (item.endsWith('.js')) {
      var testDef = require('.' + dir + item)
      if ('@sources' in testDef) {
        var sources = testDef['@sources']()
        for (var files in sources) {
          compile(sources[files], true, function (result) {
            compilationResult[result.key] = result
          })
          compile(sources[files], false, function (result) {
            compilationResult[result.key] = result
          })
        }
      }
    }
  })
  return compilationResult
}

function compile (source, optimization, addCompilationResult) {
  var missingInputs = []
  try {
    var input = compilerInput(source, {optimize: optimization})
    var result = compiler.compileStandardWrapper(input, function (path) {
      missingInputs.push(path)
    })
    input = input.replace(/(\t)|(\n)|(\\n)|( )/g, '')
  } catch (e) {
    console.log(e)
  }
  var ret = {
    key: input,
    source: source,
    optimization: optimization,
    missingInputs: missingInputs,
    result: result
  }
  addCompilationResult(ret)
}

function replaceSolCompiler (results) {
  fs.readFile('./test-browser/mockcompiler/compiler.js', 'utf8', function (error, data) {
    if (error) {
      console.log(error)
      process.exit(1)
      return
    }
    console.log(compiler.version())
    data = data + '\n\nvar mockCompilerVersion = \'' + compiler.version() + '\''
    data = data + '\n\nvar mockData = ' + JSON.stringify(results) + ';\n'
    fs.writeFile('./soljson.js', data, 'utf8', function (error) {
      if (error) {
        console.log(error)
        process.exit(1)
        return
      }
    })
  })
}
