'use strict'
const EventManager = require('./eventManager')
const helper = require('./helpers/traceHelper')
const SourceMappingDecoder = require('./sourceMappingDecoder')
const util = require('./util')

/**
 * Process the source code location for the current executing bytecode
 */
function SourceLocationTracker (_codeManager) {
  this.codeManager = _codeManager
  this.event = new EventManager()
  this.sourceMappingDecoder = new SourceMappingDecoder()
  this.sourceMapByAddress = {}
}

/**
 * Return the source location associated with the given @arg index
 *
 * @param {String} address - contract address from which the source location is retrieved
 * @param {Int} index - index in the instruction list from where the source location is retrieved
 * @param {Object} contractDetails - AST of compiled contracts
 * @param {Function} cb - callback function
 */
SourceLocationTracker.prototype.getSourceLocationFromInstructionIndex = function (address, index, contracts, cb) {
  extractSourceMap(this, this.codeManager, address, contracts, (error, sourceMap) => {
    if (error) {
      cb(error)
    } else {
      cb(null, this.sourceMappingDecoder.atIndex(index, sourceMap))
    }
  })
}

/**
 * Return the source location associated with the given @arg pc
 *
 * @param {String} address - contract address from which the source location is retrieved
 * @param {Int} vmtraceStepIndex - index of the current code in the vmtrace
 * @param {Object} contractDetails - AST of compiled contracts
 * @param {Function} cb - callback function
 */
SourceLocationTracker.prototype.getSourceLocationFromVMTraceIndex = function (address, vmtraceStepIndex, contracts, cb) {
  extractSourceMap(this, this.codeManager, address, contracts, (error, sourceMap) => {
    if (!error) {
      this.codeManager.getInstructionIndex(address, vmtraceStepIndex, (error, index) => {
        if (error) {
          cb(error)
        } else {
          cb(null, this.sourceMappingDecoder.atIndex(index, sourceMap))
        }
      })
    } else {
      cb(error)
    }
  })
}

SourceLocationTracker.prototype.clearCache = function () {
  this.sourceMapByAddress = {}
}

function getSourceMap (address, code, contracts) {
  const isCreation = helper.isContractCreation(address)
  let bytes
  for (let file in contracts) {
    for (let contract in contracts[file]) {
      bytes = isCreation ? contracts[file][contract].evm.bytecode.object : contracts[file][contract].evm.deployedBytecode.object
      if (util.compareByteCode(code, '0x' + bytes)) {
        return isCreation ? contracts[file][contract].evm.bytecode.sourceMap : contracts[file][contract].evm.deployedBytecode.sourceMap
      }
    }
  }
  return null
}

function extractSourceMap (self, codeManager, address, contracts, cb) {
  if (self.sourceMapByAddress[address]) return cb(null, self.sourceMapByAddress[address])

  codeManager.getCode(address, (error, result) => {
    if (!error) {
      const sourceMap = getSourceMap(address, result.bytecode, contracts)
      if (sourceMap) {
        if (!helper.isContractCreation(address)) self.sourceMapByAddress[address] = sourceMap
        cb(null, sourceMap)
      } else {
        cb('no sourcemap associated with the code ' + address)
      }
    } else {
      cb(error)
    }
  })
}

module.exports = SourceLocationTracker
