'use strict'

var fs = require('fs')
var solc = require('solc/wrapper')
var soljson = require('../soljson')
var compiler = solc(soljson)

var compilerInput = require('../src/app/compiler/compiler-input')

gatherCompilationResults(function (error, data) {
  if (error) {
    console.log(error)
    process.exit(1)
  } else {
    replaceSolCompiler(data)
  }
})

function gatherCompilationResults (callback) {
  var compilationResult = {}
  fs.readdir('./test-browser/tests', 'utf8', function (error, filenames) {
    if (error) {
      console.log(error)
      process.exit(1)
    } else {
      filenames.map(function (item, i) {
        var testDef = require('../test-browser/tests/' + item)
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
      })

      callback(null, compilationResult)
    }
  })
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
