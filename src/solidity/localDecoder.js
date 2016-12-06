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
    traceAnalyserEvent.register('finishAnalysing', function (index, step) {
    })
  }

  push (index, step, callStack, cache) {
    if (!this.solidityProxy.loaded()) return
    if (step.op.indexOf('PUSH') === 0) {
      var address = callStack[callStack.length - 1]
      this.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, index, this.solidityProxy.contracts, (error, result) => {
        if (error) {
          console.log(error)
        } else {
          var ast = this.solidityProxy.ast(result)
          this.solidityProxy.extractStateVariablesAt(index, (error, stateVars) => { // cached
            if (error) {
              console.log(error)
            } else {
              this.astWalker.walk(ast, (node) => {
                if (node.name === 'VariableDeclaration' && node.src.indexOf(result.start + ':' + result.length) === 0) {
                  this.locals[node.attributes.name] = {
                    type: decodeInfo.parseType(node.attributes.type, stateVars),
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
      })
    }
  }

  clear () {
    this.locals = {}
  }
}

module.exports = LocalDecoder
