'use strict'
var SourceLocationTracker = require('../code/sourceLocationTracker')
var AstWalker = require('./astWalker')
var EventManager = require('../lib/eventManager')
var decodeInfo = require('../solidity/decodeInfo')
var util = require('../helpers/util')

/**
 * Tree representing internal jump into function.
 * Triggers `callTreeReady` event when tree is ready
 * Triggers `callTreeBuildFailed` event when tree fails to build
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
        this.event.trigger('callTreeBuildFailed', ['compilation result not loaded. Cannot build internal call tree'])
      } else {
        buildTree(this, 0, '').then((result) => {
          if (result.error) {
            this.event.trigger('callTreeBuildFailed', [result.error])
          } else {
            console.log('ready')
            this.event.trigger('callTreeReady', [this.scopes, this.scopeStarts])
          }
        })
      }
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
    this.reducedTrace = []
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
    while (scope.lastStep && scope.lastStep < vmtraceIndex) {
      var matched = scopeId.match(/(.\d|\d)$/)
      scopeId = scopeId.replace(matched[1], '')
      scope = this.scopes[scopeId]
    }
    return scope
  }
}

async function buildTree (tree, step, scopeId) {
  let subScope = 1
  tree.scopeStarts[step] = scopeId
  tree.scopes[scopeId] = { firstStep: step, locals: {} }
  var currentSourceLocation = {}
  while (step < tree.traceManager.trace.length) {
    var sourceLocation
    try {
      sourceLocation = await extractSourceLocation(tree, step)
      if (sourceLocation.start !== currentSourceLocation.start ||
      sourceLocation.length !== currentSourceLocation.length ||
      sourceLocation.file !== currentSourceLocation.file) {
        tree.reducedTrace.push(step)
        currentSourceLocation = sourceLocation
      }
    } catch (e) {
      return { outStep: step, error: 'InternalCallTree - Error resolving source location. ' + step + ' ' + e.message }
    }
    if (!sourceLocation) {
      return { outStep: step, error: 'InternalCallTree - No source Location. ' + step }
    }
    if (sourceLocation.jump === 'i') {
      try {
        var result = await buildTree(tree, step + 1, scopeId === '' ? subScope.toString() : scopeId + '.' + subScope)
        if (result.error) {
          return { outStep: step, error: 'InternalCallTree - ' + result.error }
        } else {
          step = result.outStep
          subScope++
        }
      } catch (e) {
        return { outStep: step, error: 'InternalCallTree - ' + e.message }
      }
    } else if (sourceLocation.jump === 'o') {
      tree.scopes[scopeId].lastStep = step
      return { outStep: step + 1 }
    } else {
      if (tree.includeLocalVariables) {
        includeVariableDeclaration(tree, step, sourceLocation, scopeId)
      }
      step++
    }
  }
  return { outStep: step }
}

function includeVariableDeclaration (tree, step, sourceLocation, scopeId) {
  var variableDeclaration = resolveVariableDeclaration(tree, step, sourceLocation)
  if (variableDeclaration && !tree.scopes[scopeId].locals[variableDeclaration.attributes.name]) {
    tree.traceManager.getStackAt(step, (error, stack) => {
      if (!error) {
        tree.solidityProxy.contractNameAt(step, (error, contractName) => { // cached
          if (!error) {
            var states = tree.solidityProxy.extractStatesDefinitions()
            tree.scopes[scopeId].locals[variableDeclaration.attributes.name] = {
              name: variableDeclaration.attributes.name,
              type: decodeInfo.parseType(variableDeclaration.attributes.type, states, contractName),
              stackDepth: stack.length,
              sourceLocation: sourceLocation
            }
          }
        })
      }
    })
  }
}

function extractSourceLocation (tree, step) {
  return new Promise(function (resolve, reject) {
    tree.traceManager.getCurrentCalledAddressAt(step, (error, address) => {
      if (!error) {
        tree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, step, tree.solidityProxy.contracts, (error, sourceLocation) => {
          if (!error) {
            return resolve(sourceLocation)
          } else {
            return reject('InternalCallTree - Cannot retrieve sourcelocation for step ' + step + ' ' + error)
          }
        })
      } else {
        return reject('InternalCallTree - Cannot retrieve address for step ' + step + ' ' + error)
      }
    })
  })
}

function resolveVariableDeclaration (tree, step, sourceLocation) {
  if (!tree.variableDeclarationByFile[sourceLocation.file]) {
    var ast = tree.solidityProxy.ast(sourceLocation)
    if (ast) {
      tree.variableDeclarationByFile[sourceLocation.file] = extractVariableDeclarations(ast, tree.astWalker)
    } else {
      console.log('Ast not found for step ' + step + '. file ' + sourceLocation.file)
      return null
    }
  }
  return tree.variableDeclarationByFile[sourceLocation.file][sourceLocation.start + ':' + sourceLocation.length + ':' + sourceLocation.file]
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
