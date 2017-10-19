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
          var sources = testDef['@sources']()
          for (var files in sources) {
            compile({sources: sources[files]}, 1, function (result) {
              compilationResult[result.key] = result
            })
            compile({sources: sources[files]}, 0, function (result) {
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
    var result = compiler.compile(source, optimization, function (path) {
      missingInputs.push(path)
      return { error: 'Deferred import' }
    })
  } catch (e) {
    console.log(e)
  }
  var key = optimization.toString()
  for (var k in source.sources) {
    key += k + source.sources[k]
  }
  key = key.replace(/(\t)|(\n)|( )/g, '')
  var ret = {
    key: key,
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
