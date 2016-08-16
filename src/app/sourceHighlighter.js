var utils = require('./utils')
var remix = require('ethereum-remix')
var ace = require('brace')
var Range = ace.acequire('ace/range').Range

/*
  Provides source highlighting when debugging a transaction
*/
function SourceHighlighter (editor, txdebugger, compilerEvent, appEvent, switchToFile) {
  this.switchToFile = switchToFile
  this.editor = editor
  this.txdebugger = txdebugger
  this.sourceMappingDecoder = new remix.util.SourceMappingDecoder()
  this.compilationData

  this.currentSourceMap
  this.currentLineColumnLayout // used to retrieve line/column from char/length
  this.currentRange
  this.currentMarker
  this.currentExecutingAddress
  this.currentFile

  this.isDebugging = false

  var self = this

  /* hide/show marker when debugger does not have the focus */
  appEvent.register('tabChanged', function (tab) {
    if (tab !== 'debugView') {
      self.editor.removeMarker(self.currentMarker)
    } else {
      if (self.currentRange) {
        self.currentMarker = self.editor.addMarker(self.currentRange, 'highlightcode')
      }
    }
  })

  /* update compilation data */
  compilerEvent.register('compilationFinished', this, function (success, data, source) {
    if (!self.isDebugging) {
      self.reset()
      self.compilationData = success ? data : null
    }
  })

  /* update marker, switch file if necessary */
  txdebugger.codeManager.register('changed', this, function (code, address, index) {
    if (!this.currentExecutingAddress !== address) {
      // context changed, need to update srcmap
      this.currentExecutingAddress = address
      self.loadContext(txdebugger.tx, function (error, ctrName, srcmap) {
        if (!error) {
          self.currentSourceMap = srcmap
          self.currentContractName = ctrName
          self.highlightSource(index)
        }
      })
    } else {
      self.highlightSource(index)
    }
  })

  txdebugger.register('newTraceLoaded', this, function () {
    self.isDebugging = true
  })

  txdebugger.register('traceUnloaded', this, function () {
    self.reset()
    self.isDebugging = false
  })
}

/*
    * Load a new debugging context. A context is define by a new transaction.
    * it:
    *   - builds the line/column layout from the source code.
    *   - retrieves the source map
    *
    * @param {Integer} index      - the tx which defined the new debugging context
    * @param {Function} callback  - returns the decompressed source mapping for the given index {start, length, file, jump}
*/
SourceHighlighter.prototype.loadContext = function (tx, cb) {
  var self = this
  contractName(self.currentExecutingAddress, self, function (error, ctrName) {
    if (!error) {
      var srcmap = sourceMap(isContractCreation(self.currentExecutingAddress), ctrName, self.compilationData)
      cb(null, ctrName, srcmap)
    }
  })
}

/*
    * remove the editor marker and init attributes
*/
SourceHighlighter.prototype.reset = function () {
  this.currentSourceMap = null
  this.currentLineColumnLayout = null
  this.removeCurrentMarker()
  this.currentRange = null
  this.currentMarker = null
  this.currentExecutingAddress = null
  this.currentFile = null
}

/*
    * remove the current highlighted statement
*/
SourceHighlighter.prototype.removeCurrentMarker = function () {
  if (this.currentMarker) {
    this.editor.removeMarker(this.currentMarker)
    this.currentMarker = null
  }
}

/*
    * highlight the statement with the given @arg index
    *
    * @param {Integer} index - the index of the assembly item to be highlighted
*/
SourceHighlighter.prototype.highlightSource = function (index) {
  var self = this
  this.sourceMappingDecoder.decompress(index, self.currentSourceMap, function (error, rawPos) { // retrieve the sourcemap location
    if (!error) {
      if (self.currentFile !== rawPos.file) { // source file changed, need to update the line/column layout
        var file = self.compilationData.sourceList[rawPos.file]
        self.sourceMappingDecoder.retrieveLineColumnLayout(self.editor.getFile(file), function (error, result) {
          if (!error) {
            self.currentLineColumnLayout = result
            self.currentFile = rawPos.file
            self.sourceMappingDecoder.getLineColumnPosition(rawPos, self.currentLineColumnLayout, function (error, pos) {
              if (!error) {
                self.highlight(pos, rawPos.file)
              }
            })
          }
        })
      } else {
        self.sourceMappingDecoder.getLineColumnPosition(rawPos, self.currentLineColumnLayout, function (error, pos) {
          if (!error) {
            self.highlight(pos, rawPos.file)
          }
        })
      }
    }
  })
}

/*
    * highlight the statement with the given @arg position
    *
    * @param {Object} position - the position to highlight { start: {line, column}, end: {line, column} }
*/
SourceHighlighter.prototype.highlight = function (position, fileIndex) {
  var name = utils.fileNameFromKey(this.editor.getCacheFile()) // current opened tab
  var source = this.compilationData.sourceList[parseInt(fileIndex)] // auto switch to that tab
  this.removeCurrentMarker()
  if (name !== source) {
    this.switchToFile(source) // command the app to swicth to the curent file
  }
  this.currentRange = new Range(position.start.line, position.start.column, position.end.line, position.end.column)
  this.currentMarker = this.editor.addMarker(this.currentRange, 'highlightcode')
}

function sourceMap (isConstructor, contractName, compilationData) {
  if (isConstructor) {
    return compilationData.contracts[contractName].srcmap
  } else {
    return srcmapRuntime(compilationData.contracts[contractName])
  }
}

function contractName (executingAddress, self, cb) {
  if (isContractCreation(executingAddress)) {
    self.txdebugger.traceManager.getContractCreationCode(executingAddress, function (error, creationCode) {
      if (!error) {
        retrieveByteCode(creationCode, self.compilationData, 'bytecode', cb)
      }
    })
  } else {
    self.txdebugger.web3().eth.getCode(executingAddress, function (error, code) {
      if (!error) {
        retrieveByteCode(code, self.compilationData, 'runtimeBytecode', cb)
      }
    })
  }
}

function retrieveByteCode (code, compilationData, prop, cb) {
  for (var k in compilationData.contracts) {
    if (code === '0x' + compilationData.contracts[k][prop]) {
      cb(null, k)
      return
    }
    cb('unable to retrieve contract name')
  }
}

function srcmapRuntime (contract) {
  return contract.srcmapRuntime ? contract.srcmapRuntime : contract['srcmap-runtime']
}

function isContractCreation (address) {
  return address.indexOf('Contract Creation') !== -1
}

module.exports = SourceHighlighter
