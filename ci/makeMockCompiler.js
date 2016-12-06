'use strict'

var fs = require('fs')
var solc = require('solc/wrapper')
var soljson = require('../soljson')
var compiler = solc(soljson)

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
          var source = testDef['@sources']()
          var result = compile(source, 1)
          compilationResult[result.key] = result
          result = compile(source, 0)
          compilationResult[result.key] = result
        }
      })

      callback(null, compilationResult)
    }
  })
}

function compile (source, optimization) {
  var missingInputs = []
  var result = compiler.compile(source, optimization, function (path) {
    missingInputs.push(path)
  })
  var key = optimization.toString()
  for (var k in source.sources) {
    key += k + source.sources[k]
  }
  key = key.replace(/(\t)|(\n)|( )/g, '')
  return {
    key: key,
    source: source,
    optimization: optimization,
    missingInputs: missingInputs,
    result: result
  }
}

function replaceSolCompiler (results) {
  fs.readFile('./test-browser/mockcompiler/compiler.js', 'utf8', function (error, data) {
    if (error) {
      console.log(error)
      process.exit(1)
      return
    }
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
