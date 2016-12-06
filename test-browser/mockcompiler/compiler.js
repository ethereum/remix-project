'use strict'

var Module = { // eslint-disable-line
  cwrap: function () { return arguments[0] === 'version' ? version : compile },
  writeStringToMemory: function () {},
  setValue: function () {},
  Pointer_stringify: function () {},
  Runtime: {
    addFunction: function () {},
    removeFunction: function () {}
  },
  _compileJSONMulti: {},
  _compileJSONCallback: {},
  _compileJSON: {}
}

function compile (source, optimization, missingInputs) {
  if (typeof source === 'string') {
    source = JSON.parse(source)
  }
  var key = optimization.toString()
  for (var k in source.sources) {
    key += k + source.sources[k]
  }
  key = key.replace(/(\t)|(\n)|( )/g, '')
  var data = mockData[key] // eslint-disable-line
  if (data === undefined) {
    return JSON.stringify({
      errors: ['mock compiler: source not found']
    })
  } else {
    data.missingInputs.map(function (item, i) {
      if (missingInputs) {
        missingInputs(item)
      }
    })
  }
  return JSON.stringify(data.result)
}

function version () {
  return mockCompilerVersion // eslint-disable-line
}
