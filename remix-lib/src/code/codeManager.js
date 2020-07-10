'use strict'

const EventManager = require('../eventManager')
const traceHelper = require('../helpers/traceHelper')
const SourceMappingDecoder = require('../sourceMappingDecoder')
const CodeResolver = require('./codeResolver')

/*
  resolve contract code referenced by vmtrace in order to be used by asm listview.
  events:
   - changed: triggered when an item is selected
   - resolvingStep: when CodeManager resolves code/selected instruction of a new step
*/

function CodeManager (_traceManager) {
  this.event = new EventManager()
  this.isLoading = false
  this.traceManager = _traceManager
  this.codeResolver = new CodeResolver({web3: this.traceManager.web3})
}

/**
 * clear the cache
 *
 */
CodeManager.prototype.clear = function () {
  this.codeResolver.clear()
}

/**
 * resolve the code of the given @arg stepIndex and trigger appropriate event
 *
 * @param {String} stepIndex - vm trace step
 * @param {Object} tx - transaction (given by web3)
 */
CodeManager.prototype.resolveStep = function (stepIndex, tx) {
  if (stepIndex < 0) return
  this.event.trigger('resolvingStep')
  if (stepIndex === 0) {
    retrieveCodeAndTrigger(this, tx.to, stepIndex, tx)
  } else {
    this.traceManager.getCurrentCalledAddressAt(stepIndex, (error, address) => {
      if (error) {
        console.log(error)
      } else {
        retrieveCodeAndTrigger(this, address, stepIndex, tx)
      }
    })
  }
}

/**
 * Retrieve the code located at the given @arg address
 *
 * @param {String} address - address of the contract to get the code from
 * @param {Function} cb - callback function, return the bytecode
 */
CodeManager.prototype.getCode = function (address, cb) {
  if (traceHelper.isContractCreation(address)) {
    var codes = this.codeResolver.getExecutingCodeFromCache(address)
    if (!codes) {
      this.traceManager.getContractCreationCode(address, (error, hexCode) => {
        if (!error) {
          codes = this.codeResolver.cacheExecutingCode(address, hexCode)
          cb(null, codes)
        }
      })
    } else {
      cb(null, codes)
    }
  } else {
    this.codeResolver.resolveCode(address, (address, code) => {
      cb(null, code)
    })
  }
}

/**
 * Retrieve the called function for the current vm step for the given @arg address
 *
 * @param {String} stepIndex - vm trace step
 * @param {String} sourceMap - source map given byt the compilation result
 * @param {Object} ast - ast given by the compilation result
 * @return {Object} return the ast node of the function
 */
CodeManager.prototype.getFunctionFromStep = function (stepIndex, sourceMap, ast) {
  this.traceManager.getCurrentCalledAddressAt(stepIndex, (error, address) => {
    if (error) {
      console.log(error)
      return { error: 'Cannot retrieve current address for ' + stepIndex }
    } else {
      this.traceManager.getCurrentPC(stepIndex, (error, pc) => {
        if (error) {
          console.log(error)
          return { error: 'Cannot retrieve current PC for ' + stepIndex }
        } else {
          return this.getFunctionFromPC(address, pc, sourceMap, ast)
        }
      })
    }
  })
}

/**
 * Retrieve the instruction index of the given @arg step
 *
 * @param {String} address - address of the current context
 * @param {String} step - vm trace step
 * @param {Function} callback - instruction index
 */
CodeManager.prototype.getInstructionIndex = function (address, step, callback) {
  this.traceManager.getCurrentPC(step, (error, pc) => {
    if (error) {
      console.log(error)
      callback('Cannot retrieve current PC for ' + step, null)
    } else {
      const itemIndex = this.codeResolver.getInstructionIndex(address, pc)
      callback(null, itemIndex)
    }
  })
}

/**
 * Retrieve the called function for the given @arg pc and @arg address
 *
 * @param {String} address - address of the current context (used to resolve instruction index)
 * @param {String} pc - pc that point to the instruction index
 * @param {String} sourceMap - source map given byt the compilation result
 * @param {Object} ast - ast given by the compilation result
 * @return {Object} return the ast node of the function
 */
CodeManager.prototype.getFunctionFromPC = function (address, pc, sourceMap, ast) {
  const instIndex = this.codeResolver.getInstructionIndex(address, pc)
  return SourceMappingDecoder.findNodeAtInstructionIndex('FunctionDefinition', instIndex, sourceMap, ast)
}

function retrieveCodeAndTrigger (codeMananger, address, stepIndex, tx) {
  codeMananger.getCode(address, (error, result) => {
    if (!error) {
      retrieveIndexAndTrigger(codeMananger, address, stepIndex, result.instructions)
    } else {
      console.log(error)
    }
  })
}

function retrieveIndexAndTrigger (codeMananger, address, step, code) {
  codeMananger.getInstructionIndex(address, step, (error, result) => {
    if (!error) {
      codeMananger.event.trigger('changed', [code, address, result])
    } else {
      console.log(error)
    }
  })
}

module.exports = CodeManager
