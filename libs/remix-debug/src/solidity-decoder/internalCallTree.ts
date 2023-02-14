'use strict'
import { AstWalker } from '@remix-project/remix-astwalker'
import { util } from '@remix-project/remix-lib'
import { SourceLocationTracker } from '../source/sourceLocationTracker'
import { EventManager } from '../eventManager'
import { parseType } from './decodeInfo'
import { isContractCreation, isCallInstruction, isCreateInstruction, isJumpDestInstruction } from '../trace/traceHelper'
import { extractLocationFromAstVariable } from './types/util'

export type StepDetail = {
  depth: number,
  gas: number | string,
  gasCost: number,
  memory: number[],
  op: string,
  pc: number,
  stack: number[],
}

/**
 * Tree representing internal jump into function.
 * Triggers `callTreeReady` event when tree is ready
 * Triggers `callTreeBuildFailed` event when tree fails to build
 */
export class InternalCallTree {
  includeLocalVariables
  debugWithGeneratedSources
  event
  solidityProxy
  traceManager
  sourceLocationTracker
  scopes
  scopeStarts
  functionCallStack
  functionDefinitionsByScope
  variableDeclarationByFile
  functionDefinitionByFile
  astWalker
  reducedTrace
  locationAndOpcodePerVMTraceIndex: {
    [Key: number]: any
  }
  gasCostPerLine
  offsetToLineColumnConverter
  pendingConstructorExecutionAt: number
  pendingConstructorId: number
  pendingConstructor
  constructorsStartExecution
  variables: {
    [Key: number]: any
  }

  /**
    * constructor
    *
    * @param {Object} debuggerEvent  - event declared by the debugger (EthDebugger)
    * @param {Object} traceManager  - trace manager
    * @param {Object} solidityProxy  - solidity proxy
    * @param {Object} codeManager  - code manager
    * @param {Object} opts  - { includeLocalVariables, debugWithGeneratedSources }
    */
  constructor (debuggerEvent, traceManager, solidityProxy, codeManager, opts, offsetToLineColumnConverter?) {
    this.includeLocalVariables = opts.includeLocalVariables
    this.debugWithGeneratedSources = opts.debugWithGeneratedSources
    this.event = new EventManager()
    this.solidityProxy = solidityProxy
    this.traceManager = traceManager
    this.offsetToLineColumnConverter = offsetToLineColumnConverter
    this.sourceLocationTracker = new SourceLocationTracker(codeManager, { debugWithGeneratedSources: opts.debugWithGeneratedSources })
    debuggerEvent.register('newTraceLoaded', async (trace) => {
      const time = Date.now()
      this.reset()
      // each recursive call to buildTree represent a new context (either call, delegatecall, internal function)
      const calledAddress = traceManager.getCurrentCalledAddressAt(0)
      const isCreation = isContractCreation(calledAddress)

      const scopeId = '1'
      this.scopeStarts[0] = scopeId
      this.scopes[scopeId] = { firstStep: 0, locals: {}, isCreation, gasCost: 0 }

      const compResult = await this.solidityProxy.compilationResult(calledAddress)
      if (!compResult) {
        this.event.trigger('noCallTreeAvailable', [])
      } else {
        try {
          buildTree(this, 0, scopeId, isCreation).then((result) => {
            if (result.error) {
              this.event.trigger('callTreeBuildFailed', [result.error])
            } else {
              createReducedTrace(this, traceManager.trace.length - 1)
              console.log('call tree build lasts ', (Date.now() - time) / 1000)
              this.event.trigger('callTreeReady', [this.scopes, this.scopeStarts])
            }
          }, (reason) => {
            console.log('analyzing trace falls ' + reason)
            this.event.trigger('callTreeNotReady', [reason])
          })
        } catch (e) {
          console.log(e)
        }        
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
    this.functionDefinitionsByScope = {}
    this.scopeStarts = {}
    this.gasCostPerLine = {}
    this.variableDeclarationByFile = {}
    this.functionDefinitionByFile = {}
    this.astWalker = new AstWalker()
    this.reducedTrace = []
    this.locationAndOpcodePerVMTraceIndex = {}
    this.pendingConstructorExecutionAt = -1
    this.pendingConstructorId = -1
    this.constructorsStartExecution = {}
    this.pendingConstructor = null
    this.variables = {}
  }

  /**
    * find the scope given @arg vmTraceIndex
    *
    * @param {Int} vmtraceIndex  - index on the vm trace
    */
  findScope (vmtraceIndex) {
    let scopeId = this.findScopeId(vmtraceIndex)
    if (scopeId !== '' && !scopeId) return null
    let scope = this.scopes[scopeId]
    while (scope.lastStep && scope.lastStep < vmtraceIndex && scope.firstStep > 0) {
      scopeId = this.parentScope(scopeId)
      scope = this.scopes[scopeId]
    }
    return scope
  }

  parentScope (scopeId) {
    if (scopeId.indexOf('.') === -1) return ''
    return scopeId.replace(/(\.\d+)$/, '')
  }

  findScopeId (vmtraceIndex) {
    const scopes = Object.keys(this.scopeStarts)
    if (!scopes.length) return null
    const scopeStart = util.findLowerBoundValue(vmtraceIndex, scopes)
    return this.scopeStarts[scopeStart]
  }

  retrieveFunctionsStack (vmtraceIndex) {
    const scope = this.findScope(vmtraceIndex)
    if (!scope) return []
    let scopeId = this.scopeStarts[scope.firstStep]
    const scopeDetail = this.scopes[scopeId]
    const functions = []
    if (!scopeId) return functions
    let i = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      i += 1
      if (i > 1000) throw new Error('retrieFunctionStack: recursion too deep')
      const functionDefinition = this.functionDefinitionsByScope[scopeId]
      if (functionDefinition !== undefined) {
        functions.push({ ...functionDefinition, ...scopeDetail })
      }
      const parent = this.parentScope(scopeId)
      if (!parent) break
      else scopeId = parent
    }
    return functions
  }

  async extractSourceLocation (step: number, address?: string) {
    try {
      if (!address) address = this.traceManager.getCurrentCalledAddressAt(step)
      const compilationResult = await this.solidityProxy.compilationResult(address)
      return await this.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, step, compilationResult.data.contracts)
    } catch (error) {
      throw new Error('InternalCallTree - Cannot retrieve sourcelocation for step ' + step + ' ' + error)
    }
  }

  async extractValidSourceLocation (step: number, address?: string) {
    try {
      if (!address) address = this.traceManager.getCurrentCalledAddressAt(step)
      const compilationResult = await this.solidityProxy.compilationResult(address)
      return await this.sourceLocationTracker.getValidSourceLocationFromVMTraceIndex(address, step, compilationResult.data.contracts)
    } catch (error) {
      throw new Error('InternalCallTree - Cannot retrieve valid sourcelocation for step ' + step + ' ' + error)
    }
  }

  async getValidSourceLocationFromVMTraceIndexFromCache (address: string, step: number, contracts: any) {
    return await this.sourceLocationTracker.getValidSourceLocationFromVMTraceIndexFromCache(address, step, contracts, this.locationAndOpcodePerVMTraceIndex)
  }

  async getGasCostPerLine(file: number, line: number) {
    if (this.gasCostPerLine[file] && this.gasCostPerLine[file][line]) {
      return this.gasCostPerLine[file][line]
    }
    throw new Error('Could not find gas cost per line')
  }
  
  getLocalVariableById (id: number) {
    return this.variables[id]
  }
}

async function buildTree (tree, step, scopeId, isCreation, functionDefinition?, contractObj?, sourceLocation?, validSourceLocation?) {
  let subScope = 1
  if (functionDefinition) {
    const address = tree.traceManager.getCurrentCalledAddressAt(step)
    await registerFunctionParameters(tree, functionDefinition, step, scopeId, contractObj, validSourceLocation, address)
  }
  
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

  let currentSourceLocation = sourceLocation || { start: -1, length: -1, file: -1, jump: '-' }
  let previousSourceLocation = currentSourceLocation
  let previousValidSourceLocation = validSourceLocation || currentSourceLocation
  let compilationResult
  let currentAddress = ''
  while (step < tree.traceManager.trace.length) {
    let sourceLocation
    let validSourceLocation
    let address
    
    try {
      address = tree.traceManager.getCurrentCalledAddressAt(step)
      sourceLocation = await tree.extractSourceLocation(step, address)
      
      if (!includedSource(sourceLocation, currentSourceLocation)) {
        tree.reducedTrace.push(step)
        currentSourceLocation = sourceLocation
      }
      if (currentAddress !== address) {
        compilationResult = await tree.solidityProxy.compilationResult(address)
        currentAddress = address
      }
      const amountOfSources = tree.sourceLocationTracker.getTotalAmountOfSources(address, compilationResult.data.contracts)
      if (tree.sourceLocationTracker.isInvalidSourceLocation(currentSourceLocation, amountOfSources)) { // file is -1 or greater than amount of sources
        validSourceLocation = previousValidSourceLocation
      } else
        validSourceLocation = currentSourceLocation
    
    } catch (e) {
      return { outStep: step, error: 'InternalCallTree - Error resolving source location. ' + step + ' ' + e }
    }
    if (!sourceLocation) {
      return { outStep: step, error: 'InternalCallTree - No source Location. ' + step }
    }
    const stepDetail: StepDetail = tree.traceManager.trace[step]
    const nextStepDetail: StepDetail = tree.traceManager.trace[step + 1]
    if (stepDetail && nextStepDetail) {
      stepDetail.gasCost = parseInt(stepDetail.gas as string) - parseInt(nextStepDetail.gas as string)
    }
        
    // gas per line
    let lineColumnPos
    if (tree.offsetToLineColumnConverter) {
      try {
        const generatedSources = tree.sourceLocationTracker.getGeneratedSourcesFromAddress(address)
        const astSources = Object.assign({}, compilationResult.data.sources)
        const sources = Object.assign({}, compilationResult.source.sources)
        if (generatedSources) {
          for (const genSource of generatedSources) {
            astSources[genSource.name] = { id: genSource.id, ast: genSource.ast }
            sources[genSource.name] = { content: genSource.contents }
          }
        }
        
        lineColumnPos = await tree.offsetToLineColumnConverter.offsetToLineColumn(validSourceLocation, validSourceLocation.file, sources, astSources)
        if (!tree.gasCostPerLine[validSourceLocation.file]) tree.gasCostPerLine[validSourceLocation.file] = {}
        if (!tree.gasCostPerLine[validSourceLocation.file][lineColumnPos.start.line]) {
          tree.gasCostPerLine[validSourceLocation.file][lineColumnPos.start.line] = {
            gasCost: 0,
            indexes: []
          }
        }
        tree.gasCostPerLine[validSourceLocation.file][lineColumnPos.start.line].gasCost += stepDetail.gasCost
        tree.gasCostPerLine[validSourceLocation.file][lineColumnPos.start.line].indexes.push(step)
      } catch (e) {
        console.log(e)
      }
    }

    tree.locationAndOpcodePerVMTraceIndex[step] = { sourceLocation, stepDetail, lineColumnPos, contractAddress: address }
    tree.scopes[scopeId].gasCost += stepDetail.gasCost

    const contractObj = await tree.solidityProxy.contractObjectAtAddress(address)
    const generatedSources = getGeneratedSources(tree, scopeId, contractObj)
    const functionDefinition = await resolveFunctionDefinition(tree, sourceLocation, generatedSources, address)

    const isInternalTxInstrn = isCallInstruction(stepDetail)
    const isCreateInstrn = isCreateInstruction(stepDetail)
    // we are checking if we are jumping in a new CALL or in an internal function

    const constructorExecutionStarts = tree.pendingConstructorExecutionAt > -1 && tree.pendingConstructorExecutionAt < validSourceLocation.start
    if (functionDefinition && functionDefinition.kind === 'constructor' && tree.pendingConstructorExecutionAt === -1 && !tree.constructorsStartExecution[functionDefinition.id]) {
      tree.pendingConstructorExecutionAt = validSourceLocation.start
      tree.pendingConstructorId = functionDefinition.id
      tree.pendingConstructor = functionDefinition
      // from now on we'll be waiting for a change in the source location which will mark the beginning of the constructor execution.
      // constructorsStartExecution allows to keep track on which constructor has already been executed.
    }
    const internalfunctionCall = functionDefinition && previousSourceLocation.jump === 'i'
    if (constructorExecutionStarts || isInternalTxInstrn || internalfunctionCall) {
      try {
        const newScopeId = scopeId === '' ? subScope.toString() : scopeId + '.' + subScope
        tree.scopeStarts[step] = newScopeId
        tree.scopes[newScopeId] = { firstStep: step, locals: {}, isCreation, gasCost: 0 }
        // for the ctor we we are at the start of its trace, we have to replay this step in order to catch all the locals:
        const nextStep = constructorExecutionStarts ? step : step + 1
        if (constructorExecutionStarts) {
          tree.constructorsStartExecution[tree.pendingConstructorId] = tree.pendingConstructorExecutionAt
          tree.pendingConstructorExecutionAt = -1
          tree.pendingConstructorId = -1
          await registerFunctionParameters(tree, tree.pendingConstructor, step, newScopeId, contractObj, previousValidSourceLocation, address)
          tree.pendingConstructor = null
        }
        const externalCallResult = await buildTree(tree, nextStep, newScopeId, isCreateInstrn, functionDefinition, contractObj, sourceLocation, validSourceLocation)
        if (externalCallResult.error) {
          return { outStep: step, error: 'InternalCallTree - ' + externalCallResult.error }
        } else {
          step = externalCallResult.outStep
          subScope++
        }
      } catch (e) {
        return { outStep: step, error: 'InternalCallTree - ' + e.message }
      }
    } else if (callDepthChange(step, tree.traceManager.trace) || (sourceLocation.jump === 'o' && functionDefinition)) {
      // if not, we might be returning from a CALL or internal function. This is what is checked here.
      tree.scopes[scopeId].lastStep = step
      return { outStep: step + 1 }
    } else {
      // if not, we are in the current scope.
      // We check in `includeVariableDeclaration` if there is a new local variable in scope for this specific `step`
      if (tree.includeLocalVariables) {
        await includeVariableDeclaration(tree, step, sourceLocation, scopeId, contractObj, generatedSources, address)
      }
      previousSourceLocation = sourceLocation
      previousValidSourceLocation = validSourceLocation
      step++
    }
  }
  return { outStep: step }
}

// the reduced trace contain an entry only if that correspond to a new source location
function createReducedTrace (tree, index) {
  tree.reducedTrace.push(index)
}

function getGeneratedSources (tree, scopeId, contractObj) {
  if (tree.debugWithGeneratedSources && contractObj && tree.scopes[scopeId]) {
    return tree.scopes[scopeId].isCreation ? contractObj.contract.evm.bytecode.generatedSources : contractObj.contract.evm.deployedBytecode.generatedSources
  }
  return null
}

async function registerFunctionParameters (tree, functionDefinition, step, scopeId, contractObj, sourceLocation, address) {
  tree.functionCallStack.push(step)
  const functionDefinitionAndInputs = { functionDefinition, inputs: [] }
  // means: the previous location was a function definition && JUMPDEST
  // => we are at the beginning of the function and input/output are setup
  try {
    const stack = tree.traceManager.getStackAt(step)
    const states = await tree.solidityProxy.extractStatesDefinitions(address)
    if (functionDefinition.parameters) {
      const inputs = functionDefinition.parameters
      const outputs = functionDefinition.returnParameters
      // input params
      if (inputs && inputs.parameters) {
        functionDefinitionAndInputs.inputs = addParams(inputs, tree, scopeId, states, contractObj, sourceLocation, stack.length, inputs.parameters.length, -1)
      }
      // output params
      if (outputs) addParams(outputs, tree, scopeId, states, contractObj, sourceLocation, stack.length, 0, 1)
    }
  } catch (error) {
    console.log(error)
  }

  tree.functionDefinitionsByScope[scopeId] = functionDefinitionAndInputs
}

async function includeVariableDeclaration (tree, step, sourceLocation, scopeId, contractObj, generatedSources, address) {
  let states = null
  const variableDeclarations = await resolveVariableDeclaration(tree, sourceLocation, generatedSources, address)
  // using the vm trace step, the current source location and the ast,
  // we check if the current vm trace step target a new ast node of type VariableDeclaration
  // that way we know that there is a new local variable from here.
  if (variableDeclarations && variableDeclarations.length) {
    for (const variableDeclaration of variableDeclarations) {
      if (variableDeclaration && !tree.scopes[scopeId].locals[variableDeclaration.name]) {
        try {
          const stack = tree.traceManager.getStackAt(step)
          // the stack length at this point is where the value of the new local variable will be stored.
          // so, either this is the direct value, or the offset in memory. That depends on the type.
          if (variableDeclaration.name !== '') {
            states = await tree.solidityProxy.extractStatesDefinitions(address)
            let location = extractLocationFromAstVariable(variableDeclaration)
            location = location === 'default' ? 'storage' : location
            // we push the new local variable in our tree
            const newVar = {
              name: variableDeclaration.name,
              type: parseType(variableDeclaration.typeDescriptions.typeString, states, contractObj.name, location),
              stackDepth: stack.length,
              sourceLocation: sourceLocation
            }
            tree.scopes[scopeId].locals[variableDeclaration.name] = newVar
            tree.variables[variableDeclaration.id] = newVar
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
}

// this extract all the variable declaration for a given ast and file
// and keep this in a cache
async function resolveVariableDeclaration (tree, sourceLocation, generatedSources, address) {
  if (!tree.variableDeclarationByFile[sourceLocation.file]) {
    const ast = await tree.solidityProxy.ast(sourceLocation, generatedSources, address)
    if (ast) {
      tree.variableDeclarationByFile[sourceLocation.file] = extractVariableDeclarations(ast, tree.astWalker)
    } else {
      return null
    }
  }
  return tree.variableDeclarationByFile[sourceLocation.file][sourceLocation.start + ':' + sourceLocation.length + ':' + sourceLocation.file]
}

// this extract all the function definition for a given ast and file
// and keep this in a cache
async function resolveFunctionDefinition (tree, sourceLocation, generatedSources, address) {
  if (!tree.functionDefinitionByFile[sourceLocation.file]) {
    const ast = await tree.solidityProxy.ast(sourceLocation, generatedSources, address)
    if (ast) {
      tree.functionDefinitionByFile[sourceLocation.file] = extractFunctionDefinitions(ast, tree.astWalker)
    } else {
      return null
    }
  }
  return tree.functionDefinitionByFile[sourceLocation.file][sourceLocation.start + ':' + sourceLocation.length + ':' + sourceLocation.file]
}

function extractVariableDeclarations (ast, astWalker) {
  const ret = {}
  astWalker.walkFull(ast, (node) => {
    if (node.nodeType === 'VariableDeclaration' || node.nodeType === 'YulVariableDeclaration') {
      ret[node.src] = [node]
    }
    const hasChild = node.initialValue && (node.nodeType === 'VariableDeclarationStatement' || node.nodeType === 'YulVariableDeclarationStatement')
    if (hasChild) ret[node.initialValue.src] = node.declarations
  })
  return ret
}

function extractFunctionDefinitions (ast, astWalker) {
  const ret = {}
  astWalker.walkFull(ast, (node) => {
    if (node.nodeType === 'FunctionDefinition' || node.nodeType === 'YulFunctionDefinition') {
      ret[node.src] = node
    }
  })
  return ret
}

function addParams (parameterList, tree, scopeId, states, contractObj, sourceLocation, stackLength, stackPosition, dir) {
  const contractName = contractObj.name
  const params = []
  for (const inputParam in parameterList.parameters) {
    const param = parameterList.parameters[inputParam]
    const stackDepth = stackLength + (dir * stackPosition)
    if (stackDepth >= 0) {
      let location = extractLocationFromAstVariable(param)
      location = location === 'default' ? 'memory' : location
      const attributesName = param.name === '' ? `$${inputParam}` : param.name
      const newParam = {
        name: attributesName,
        type: parseType(param.typeDescriptions.typeString, states, contractName, location),
        stackDepth: stackDepth,
        sourceLocation: sourceLocation,
        abi: contractObj.contract.abi,
        isParameter: true
      }
      tree.scopes[scopeId].locals[attributesName] = newParam
      params.push(attributesName)
      if (!tree.variables[param.id]) tree.variables[param.id] = newParam
    }
    stackPosition += dir
  }
  return params
}
