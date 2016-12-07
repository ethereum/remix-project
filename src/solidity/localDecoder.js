'use strict'
var SourceLocationTracker = require('../code/sourceLocationTracker')
var AstWalker = require('../util/astWalker')
var decodeInfo = require('../solidity/decodeInfo')

class LocalDecoder {
  constructor (codeManager, traceAnalyserEvent, solidityProxy) {
    this.astWalker = new AstWalker()
    this.sourceLocationTracker = new SourceLocationTracker(codeManager)
    this.solidityProxy = solidityProxy
    this.locals = {}
    var self = this
    traceAnalyserEvent.register('startAnalysing', function (step) {
      self.clear()
    })
    traceAnalyserEvent.register('onOp', function (index, step, callStack, cache) {
      self.push(index, step, callStack, cache)
    })
    traceAnalyserEvent.register('finishAnalysing', function (index, step) {})
    this.variableDeclarationByFile = {}
  }

  push (index, step, callStack, cache) {
    if (!this.solidityProxy.loaded()) return
    if (step.op.indexOf('PUSH') === 0) {
      var address = callStack[callStack.length - 1]
      this.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, index, this.solidityProxy.contracts, (error, result) => {
        if (error) {
          console.log(error)
        } else {
          if (!this.variableDeclarationByFile[result.file]) {
            var ast = this.solidityProxy.ast(result)
            this.variableDeclarationByFile[result.file] = extractVariableDeclarations(ast, this.astWalker)
          }
          var variableDeclarations = this.variableDeclarationByFile[result.file]
          this.solidityProxy.extractStateVariablesAt(index, (error, stateVars) => { // cached
            if (error) {
              console.log(error)
            } else {
              for (var dec of variableDeclarations) {
                if (dec.src.indexOf(result.start + ':' + result.length) === 0) {
                  this.locals[dec.attributes.name] = {
                    type: decodeInfo.parseType(dec.attributes.type, stateVars),
                    stack: step.stack
                  }
                }
              }
            }
          })
        }
      })
    }
  }

  clear () {
    this.locals = {}
    this.variableDeclarationByFile = {}
  }
}

function extractVariableDeclarations (ast, astWalker) {
  var ret = []
  astWalker.walk(ast, (node) => {
    if (node.name === 'VariableDeclaration') {
      ret.push(node)
    }
    return true
  })
  return ret
}

module.exports = LocalDecoder
