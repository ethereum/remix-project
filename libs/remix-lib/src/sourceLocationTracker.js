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
SourceLocationTracker.prototype.getSourceLocationFromInstructionIndex = function (address, index, contracts) {
  return new Promise((resolve, reject) => {
    extractSourceMap(this, this.codeManager, address, contracts).then((sourceMap) => {
      resolve(this.sourceMappingDecoder.atIndex(index, sourceMap))
    }).catch(reject)
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
SourceLocationTracker.prototype.getSourceLocationFromVMTraceIndex = function (address, vmtraceStepIndex, contracts) {
  return new Promise((resolve, reject) => {
    extractSourceMap(this, this.codeManager, address, contracts).then((sourceMap) => {
      this.codeManager.getInstructionIndex(address, vmtraceStepIndex, (error, index) => {
        if (error) {
          reject(error)
        } else {
          resolve(this.sourceMappingDecoder.atIndex(index, sourceMap))
        }
      })
    }).catch(reject)
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
      const bytecode = contracts[file][contract].evm.bytecode
      const deployedBytecode = contracts[file][contract].evm.deployedBytecode
      if (!deployedBytecode) continue

      bytes = isCreation ? bytecode.object : deployedBytecode.object
      if (util.compareByteCode(code, '0x' + bytes)) {
        return isCreation ? bytecode.sourceMap : deployedBytecode.sourceMap
      }
    }
  }
  return null
}

function extractSourceMap (self, codeManager, address, contracts) {
  return new Promise((resolve, reject) => {
    if (self.sourceMapByAddress[address]) return resolve(self.sourceMapByAddress[address])

    codeManager.getCode(address).then((result) => {
      const sourceMap = getSourceMap(address, result.bytecode, contracts)
      if (sourceMap) {
        if (!helper.isContractCreation(address)) self.sourceMapByAddress[address] = sourceMap
        resolve(sourceMap)
      } else {
        reject('no sourcemap associated with the code ' + address)
      }
    }).catch(reject)
  })
}

module.exports = SourceLocationTracker
