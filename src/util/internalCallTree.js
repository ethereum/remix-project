'use strict'
var SourceLocationTracker = require('../code/sourceLocationTracker')
var AstWalker = require('./astWalker')
var EventManager = require('../lib/eventManager')
var decodeInfo = require('../solidity/decodeInfo')
var util = require('../helpers/util')

/**
 * Tree representing internal jump into function.
 * Trigger `callTreeReady` event when tree is ready
 */
class InternalCallTree {
  /**
    * constructor
    *
    * @param {Object} debuggerEvent  - event declared by the debugger (EthDebugger)
    * @param {Object} traceManager  - trace manager
    * @param {Object} solidityProxy  - solidity proxy
    * @param {Object} codeManager  - code manager
    * @param {Object} opts  - { includeLocalVariables }
    */
  constructor (debuggerEvent, traceManager, solidityProxy, codeManager, opts) {
    this.includeLocalVariables = opts.includeLocalVariables
    this.event = new EventManager()
    this.solidityProxy = solidityProxy
    this.traceManager = traceManager
    this.sourceLocationTracker = new SourceLocationTracker(codeManager)
    debuggerEvent.register('newTraceLoaded', (trace) => {
      this.reset()
      if (!this.solidityProxy.loaded()) {
        console.log('compilation result not loaded. Cannot build internal call tree')
      } else {
        buildTree(this, 0, '', trace)
      }
      this.event.trigger('callTreeReady', [this.scopes, this.scopeStarts])
    })
  }

  /**
    * reset tree
    *
    */
  reset () {
    /*
      scopes: map of scopes defined by range in the vmtrace {firstStep, lastStep, locals}. Keys represent the level of deepness (scopeId)
    */
    this.scopes = {}
    /*
      scopeStart: represent start of a new scope. Keys are index in the vmtrace, values are scopeId
    */
    this.scopeStarts = {}
    this.variableDeclarationByFile = {}
    this.astWalker = new AstWalker()
  }

  /**
    * find the scope given @arg vmTraceIndex
    *
    * @param {Int} vmtraceIndex  - index on the vm trace
    */
  findScope (vmtraceIndex) {
    var scopes = Object.keys(this.scopeStarts)
    if (!scopes.length) {
      return null
    }
    var scopeId = util.findLowerBoundValue(vmtraceIndex, scopes)
    scopeId = this.scopeStarts[scopeId]
    var scope = this.scopes[scopeId]
    var reg = /(.\d|\d)$/
    while (scope.lastStep && scope.lastStep < vmtraceIndex) {
      var matched = scopeId.match(reg)
      scopeId = scopeId.replace(matched[1], '')
      scope = this.scopes[scopeId]
    }
    return scope
  }
}

 /**
   * build tree (called recursively)
   *
   * @param {Object} tree  - instance of InternalCallTree
   * @param {Int} step  - index on the vm trace
   * @param {String} scopeId  - deepness of the current scope
   * @param {Object} trace  - vm trace
   */
function buildTree (tree, step, scopeId, trace) {
  let subScope = 1
  tree.scopeStarts[step] = scopeId
  tree.scopes[scopeId] = { firstStep: step }
  while (step < trace.length) {
    var sourceLocation
    extractSourceLocation(tree, step, (error, src) => {
      if (error) {
        console.log(error)
      } else {
        sourceLocation = src
      }
    })
    if (sourceLocation.jump === 'i') {
      step = buildTree(tree, step + 1, scopeId === '' ? subScope.toString() : scopeId + '.' + subScope, trace)
      subScope++
    } else if (sourceLocation.jump === 'o') {
      tree.scopes[scopeId].lastStep = step
      return step + 1
    } else {
      if (tree.includeLocalVariables) {
        var variableDeclaration = resolveVariableDeclaration(tree, step, sourceLocation)
        if (variableDeclaration) {
          if (!tree.scopes[scopeId].locals) {
            tree.scopes[scopeId].locals = {}
          }
          tree.traceManager.getStackAt(step, (error, stack) => {
            if (!error) {
              tree.solidityProxy.contractNameAt(step, (error, contractName) => { // cached
                if (!error) {
                  var states = tree.solidityProxy.extractStatesDefinitions()
                  tree.scopes[scopeId].locals[variableDeclaration.attributes.name] = {
                    name: variableDeclaration.attributes.name,
                    type: decodeInfo.parseType(variableDeclaration.attributes.type, states, contractName),
                    stackHeight: stack.length
                  }
                }
              })
            }
          })
        }
      }

      step++
    }
  }
}

function extractSourceLocation (tree, step, cb) {
  tree.traceManager.getCurrentCalledAddressAt(step, (error, address) => {
    if (!error) {
      tree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, step, tree.solidityProxy.contracts, (error, sourceLocation) => {
        if (!error) {
          cb(null, sourceLocation)
        } else {
          cb('InternalCallTree - Cannot retrieve sourcelocation for step ' + step)
        }
      })
    } else {
      cb('InternalCallTree - Cannot retrieve address for step ' + step)
    }
  })
}

function resolveVariableDeclaration (tree, step, sourceLocation) {
  if (!tree.variableDeclarationByFile[sourceLocation.file]) {
    tree.variableDeclarationByFile[sourceLocation.file] = extractVariableDeclarations(tree.solidityProxy.ast(sourceLocation), tree.astWalker)
  }
  var variableDeclarations = tree.variableDeclarationByFile[sourceLocation.file]
  return variableDeclarations[sourceLocation.start + ':' + sourceLocation.length + ':' + sourceLocation.file]
}

function extractVariableDeclarations (ast, astWalker) {
  var ret = {}
  astWalker.walk(ast, (node) => {
    if (node.name === 'VariableDeclaration') {
      ret[node.src] = node
    }
    return true
  })
  return ret
}

module.exports = InternalCallTree
