'use strict'
const remixLib = require('remix-lib')
const SourceLocationTracker = remixLib.SourceLocationTracker
const AstWalker = remixLib.AstWalker
const EventManager = remixLib.EventManager
const decodeInfo = require('./decodeInfo')
const util = remixLib.util
const traceHelper = remixLib.helpers.trace
const typesUtil = require('./types/util.js')

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
        // each recursive call to buildTree represent a new context (either call, delegatecall, internal function)
        buildTree(this, 0, '', true).then((result) => {
          if (result.error) {
            this.event.trigger('callTreeBuildFailed', [result.error])
          } else {
            createReducedTrace(this, traceManager.trace.length - 1)
            this.event.trigger('callTreeReady', [this.scopes, this.scopeStarts])
          }
        }, (reason) => {
          console.log('analyzing trace falls ' + reason)
          this.event.trigger('callTreeNotReady', [reason])
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
      scopes: map of scopes defined by range in the vmtrace {firstStep, lastStep, locals}.
      Keys represent the level of deepness (scopeId)
      scopeId : <currentscope_id>.<sub_scope_id>.<sub_sub_scope_id>
    */
    this.scopes = {}
    /*
      scopeStart: represent start of a new scope. Keys are index in the vmtrace, values are scopeId
    */
    this.sourceLocationTracker.clearCache()
    this.functionCallStack = []
    this.scopeStarts = {}
    this.variableDeclarationByFile = {}
    this.functionDefinitionByFile = {}
    this.astWalker = new AstWalker()
    this.reducedTrace = []
  }

  /**
    * find the scope given @arg vmTraceIndex
    *
    * @param {Int} vmtraceIndex  - index on the vm trace
    */
  findScope (vmtraceIndex) {
    const scopes = Object.keys(this.scopeStarts)
    if (!scopes.length) {
      return null
    }
    let scopeId = util.findLowerBoundValue(vmtraceIndex, scopes)
    scopeId = this.scopeStarts[scopeId]
    let scope = this.scopes[scopeId]
    while (scope.lastStep && scope.lastStep < vmtraceIndex && scope.firstStep > 0) {
      const matched = scopeId.match(/(.\d|\d)$/)
      scopeId = scopeId.replace(matched[1], '')
      scope = this.scopes[scopeId]
    }
    return scope
  }

  extractSourceLocation (step) {
    return new Promise((resolve, reject) => {
      this.traceManager.getCurrentCalledAddressAt(step, (error, address) => {
        if (!error) {
          this.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, step, this.solidityProxy.contracts, (error, sourceLocation) => {
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
}

async function buildTree (tree, step, scopeId, isExternalCall) {
  let subScope = 1
  tree.scopeStarts[step] = scopeId
  tree.scopes[scopeId] = { firstStep: step, locals: {} }

  function callDepthChange (step, trace) {
    if (step + 1 < trace.length) {
      return trace[step].depth !== trace[step + 1].depth
    }
    return false
  }

  function includedSource (source, included) {
    return (included.start !== -1 &&
        included.length !== -1 &&
        included.file !== -1 &&
        included.start >= source.start &&
        included.start + included.length <= source.start + source.length &&
        included.file === source.file)
  }

  let currentSourceLocation = {start: -1, length: -1, file: -1}
  let previousSourceLocation = currentSourceLocation
  while (step < tree.traceManager.trace.length) {
    let sourceLocation
    let newLocation = false
    try {
      sourceLocation = await tree.extractSourceLocation(step)
      if (!includedSource(sourceLocation, currentSourceLocation)) {
        tree.reducedTrace.push(step)
        currentSourceLocation = sourceLocation
        newLocation = true
      }
    } catch (e) {
      return { outStep: step, error: 'InternalCallTree - Error resolving source location. ' + step + ' ' + e }
    }
    if (!sourceLocation) {
      return { outStep: step, error: 'InternalCallTree - No source Location. ' + step }
    }
    const isCallInstruction = traceHelper.isCallInstruction(tree.traceManager.trace[step])
    // we are checking if we are jumping in a new CALL or in an internal function
    if (isCallInstruction || sourceLocation.jump === 'i') {
      try {
        const externalCallResult = await buildTree(tree, step + 1, scopeId === '' ? subScope.toString() : scopeId + '.' + subScope, isCallInstruction)
        if (externalCallResult.error) {
          return { outStep: step, error: 'InternalCallTree - ' + externalCallResult.error }
        } else {
          step = externalCallResult.outStep
          subScope++
        }
      } catch (e) {
        return { outStep: step, error: 'InternalCallTree - ' + e.message }
      }
    } else if ((isExternalCall && callDepthChange(step, tree.traceManager.trace)) || (!isExternalCall && sourceLocation.jump === 'o')) {
      // if not, we might be returning from a CALL or internal function. This is what is checked here.
      tree.scopes[scopeId].lastStep = step
      return { outStep: step + 1 }
    } else {
      // if not, we are in the current scope.
      // We check in `includeVariableDeclaration` if there is a new local variable in scope for this specific `step`
      if (tree.includeLocalVariables) {
        includeVariableDeclaration(tree, step, sourceLocation, scopeId, newLocation, previousSourceLocation)
      }
      previousSourceLocation = sourceLocation
      step++
    }
  }
  return { outStep: step }
}

// the reduced trace contain an entry only if that correspond to a new source location
function createReducedTrace (tree, index) {
  tree.reducedTrace.push(index)
}

function includeVariableDeclaration (tree, step, sourceLocation, scopeId, newLocation, previousSourceLocation) {
  const variableDeclaration = resolveVariableDeclaration(tree, step, sourceLocation)
  // using the vm trace step, the current source location and the ast,
  // we check if the current vm trace step target a new ast node of type VariableDeclaration
  // that way we know that there is a new local variable from here.
  if (variableDeclaration && !tree.scopes[scopeId].locals[variableDeclaration.attributes.name]) {
    tree.traceManager.getStackAt(step, (error, stack) => {
      // the stack length at this point is where the value of the new local variable will be stored.
      // so, either this is the direct value, or the offset in memory. That depends on the type.
      if (!error) {
        tree.solidityProxy.contractNameAt(step, (error, contractName) => { // cached
          if (!error) {
            var states = tree.solidityProxy.extractStatesDefinitions()
            var location = typesUtil.extractLocationFromAstVariable(variableDeclaration)
            location = location === 'default' ? 'storage' : location
            // we push the new local variable in our tree
            tree.scopes[scopeId].locals[variableDeclaration.attributes.name] = {
              name: variableDeclaration.attributes.name,
              type: decodeInfo.parseType(variableDeclaration.attributes.type, states, contractName, location),
              stackDepth: stack.length,
              sourceLocation: sourceLocation
            }
          }
        })
      }
    })
  }
  // we check here if we are at the beginning inside a new function.
  // if that is the case, we have to add to locals tree the inputs and output params
  const functionDefinition = resolveFunctionDefinition(tree, step, previousSourceLocation)
  if (functionDefinition && (newLocation && traceHelper.isJumpDestInstruction(tree.traceManager.trace[step - 1]) || functionDefinition.attributes.isConstructor)) {
    tree.functionCallStack.push(step)
    // means: the previous location was a function definition && JUMPDEST
    // => we are at the beginning of the function and input/output are setup
    tree.solidityProxy.contractNameAt(step, (error, contractName) => { // cached
      if (!error) {
        tree.traceManager.getStackAt(step, (error, stack) => {
          if (!error) {
            var states = tree.solidityProxy.extractStatesDefinitions()
            // input params
            addParams(functionDefinition.children[0], tree, scopeId, states, contractName, previousSourceLocation, stack.length, functionDefinition.children[0].children.length, -1)
            // output params
            addParams(functionDefinition.children[1], tree, scopeId, states, contractName, previousSourceLocation, stack.length, 0, 1)
          }
        })
      }
    })
  }
}

// this extract all the variable declaration for a given ast and file
// and keep this in a cache
function resolveVariableDeclaration (tree, step, sourceLocation) {
  if (!tree.variableDeclarationByFile[sourceLocation.file]) {
    const ast = tree.solidityProxy.ast(sourceLocation)
    if (ast) {
      tree.variableDeclarationByFile[sourceLocation.file] = extractVariableDeclarations(ast, tree.astWalker)
    } else {
      // console.log('Ast not found for step ' + step + '. file ' + sourceLocation.file)
      return null
    }
  }
  return tree.variableDeclarationByFile[sourceLocation.file][sourceLocation.start + ':' + sourceLocation.length + ':' + sourceLocation.file]
}

// this extract all the function definition for a given ast and file
// and keep this in a cache
function resolveFunctionDefinition (tree, step, sourceLocation) {
  if (!tree.functionDefinitionByFile[sourceLocation.file]) {
    const ast = tree.solidityProxy.ast(sourceLocation)
    if (ast) {
      tree.functionDefinitionByFile[sourceLocation.file] = extractFunctionDefinitions(ast, tree.astWalker)
    } else {
      // console.log('Ast not found for step ' + step + '. file ' + sourceLocation.file)
      return null
    }
  }
  return tree.functionDefinitionByFile[sourceLocation.file][sourceLocation.start + ':' + sourceLocation.length + ':' + sourceLocation.file]
}

function extractVariableDeclarations (ast, astWalker) {
  const ret = {}
  astWalker.walk(ast, (node) => {
    if (node.name === 'VariableDeclaration') {
      ret[node.src] = node
    }
    return true
  })
  return ret
}

function extractFunctionDefinitions (ast, astWalker) {
  const ret = {}
  astWalker.walk(ast, (node) => {
    if (node.name === 'FunctionDefinition') {
      ret[node.src] = node
    }
    return true
  })
  return ret
}

function addParams (parameterList, tree, scopeId, states, contractName, sourceLocation, stackLength, stackPosition, dir) {
  for (let inputParam in parameterList.children) {
    const param = parameterList.children[inputParam]
    const stackDepth = stackLength + (dir * stackPosition)
    if (stackDepth >= 0) {
      let location = typesUtil.extractLocationFromAstVariable(param)
      location = location === 'default' ? 'memory' : location
      tree.scopes[scopeId].locals[param.attributes.name] = {
        name: param.attributes.name,
        type: decodeInfo.parseType(param.attributes.type, states, contractName, location),
        stackDepth: stackDepth,
        sourceLocation: sourceLocation
      }
    }
    stackPosition += dir
  }
}

module.exports = InternalCallTree
