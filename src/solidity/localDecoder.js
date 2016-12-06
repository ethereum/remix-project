'use strict'
var SourceLocationTracker = require('../code/sourceLocationTracker')
var AstWalker = require('../util/astWalker')
var decodeInfo = require('../solidity/decodeInfo')

function LocalDecoder (parent, codeManager, traceAnalyserEvent) {
  this.astWalker = new AstWalker()
  this.codeManager = this.codeManager
  this.parent = parent
  this.locals = {}
  this.loading = false
  this.sourceLocationTracker = new SourceLocationTracker(this.codeManager)
  var self = this
  traceAnalyserEvent.register('startAnalysing', function (step) {
    self.clear()
  })
  traceAnalyserEvent.register('onOp', function (index, step, callStack, cache) {
    self.push(index, step, callStack, cache)
  })
  traceAnalyserEvent.register('finishAnalysing', function (index, step) {
    self.loading = true
  })
}

LocalDecoder.prototype.push = function (index, step, callStack, cache) {
  if (!this.parent.sources) return
  if (step.op.indexOf('PUSH') === 0) {
    var self = this
    var compiledContracts = this.parent.contractsDetail
    var address = callStack[callStack.length - 1]
    this.sourceLocationTracker.getSourceLocation(address, index, compiledContracts, function (error, result) {
      if (error) {
        console.log(error)
      } else {
        var file = self.parent.sourceList[result.file]
        var ast = self.parent.sources[file]
        this.astWalker.walk(ast, function (node) {
          if (node.name === 'VariableDeclaration' && node.src.indexOf(result.start + ':' + result.length) === 0) {
            self.locals[node.attributes.name] = {
              type: decodeInfo.parseType(node, []),
              stack: step.stack
            }
            return false
          } else {
            return true
          }
        })
      }
    })
  }
}

LocalDecoder.prototype.clear = function () {
  this.loading = false
  this.locals = {}
}

module.exports = LocalDecoder
