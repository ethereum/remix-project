'use strict'
var $ = require('jquery')
var ethJSABI = require('ethereumjs-abi')
var helper = require('./txHelper')

module.exports = {
  /**
    * build the transaction data
    *
    * @param {Object} contract    - abi definition of the current contract.
    * @param {Object} contracts    - map of all compiled contracts.
    * @param {Bool} isConstructor    - isConstructor.
    * @param {Object} funAbi    - abi definition of the function to call. null if building data for the ctor.
    * @param {Object} params    - input paramater of the function to call
    * @param {Object} udapp    - udapp
    * @param {Object} executionContext    - executionContext
    * @param {Function} callback    - callback
    */
  buildData: function (contract, contracts, isConstructor, funAbi, params, udapp, executionContext, callback) {
    var funArgs = ''
    try {
      funArgs = $.parseJSON('[' + params + ']')
    } catch (e) {
      callback('Error encoding arguments: ' + e)
      return
    }
    var data = ''
    var dataHex = ''
    if (!isConstructor || funArgs.length > 0) {
      try {
        data = helper.encodeParams(funAbi, funArgs)
        dataHex = data.toString('hex')
      } catch (e) {
        callback('Error encoding arguments: ' + e)
        return
      }
    }
    if (data.slice(0, 9) === 'undefined') {
      dataHex = data.slice(9)
    }
    if (data.slice(0, 2) === '0x') {
      dataHex = data.slice(2)
    }
    if (isConstructor) {
      var bytecodeToDeploy = contract.bytecode
      if (bytecodeToDeploy.indexOf('_') >= 0) {
        this.linkBytecode(contract, contracts, executionContext, udapp, (err, bytecode) => {
          if (err) {
            callback('Error deploying required libraries: ' + err)
          } else {
            bytecodeToDeploy = bytecode + dataHex
            return callback(null, bytecodeToDeploy)
          }
        })
        return
      } else {
        dataHex = bytecodeToDeploy + dataHex
      }
    } else {
      dataHex = Buffer.concat([helper.encodeFunctionId(funAbi), data]).toString('hex')
    }
    callback(null, dataHex)
  },

  atAddress: function () {},

  linkBytecode: function (contract, contracts, executionContext, udapp, callback) {
    var bytecode = contract.bytecode
    if (bytecode.indexOf('_') < 0) {
      return callback(null, bytecode)
    }
    var m = bytecode.match(/__([^_]{1,36})__/)
    if (!m) {
      return callback('Invalid bytecode format.')
    }
    var libraryName = m[1]
    var libraryabi = helper.getContractByName(libraryName, contracts)
    if (!libraryabi) {
      return callback('Library ' + libraryName + ' not found.')
    }
    this.deployLibrary(libraryabi, executionContext, udapp, (err, address) => {
      if (err) {
        return callback(err)
      }
      var libLabel = '__' + libraryName + Array(39 - libraryName.length).join('_')
      var hexAddress = address.toString('hex')
      if (hexAddress.slice(0, 2) === '0x') {
        hexAddress = hexAddress.slice(2)
      }
      hexAddress = Array(40 - hexAddress.length + 1).join('0') + hexAddress
      while (bytecode.indexOf(libLabel) >= 0) {
        bytecode = bytecode.replace(libLabel, hexAddress)
      }
      contract.bytecode = bytecode
      this.linkBytecode(contract, contracts, executionContext, udapp, callback)
    })
  },

  deployLibrary: function (libraryName, library, executionContext, udapp, callback) {
    var address = library.address
    if (address) {
      return callback(null, address)
    }
    var bytecode = library.bytecode
    if (bytecode.indexOf('_') >= 0) {
      this.linkBytecode(libraryName, (err, bytecode) => {
        if (err) callback(err)
        else this.deployLibrary(libraryName, callback)
      })
    } else {
      udapp.runTx({ data: bytecode, useCall: false }, (err, txResult) => {
        if (err) {
          return callback(err)
        }
        var address = executionContext.isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
        library.address = address
        callback(err, address)
      })
    }
  },

  decodeResponse: function (response, fnabi, callback) {
    // Only decode if there supposed to be fields
    if (fnabi.outputs && fnabi.outputs.length > 0) {
      try {
        var i

        var outputTypes = []
        for (i = 0; i < fnabi.outputs.length; i++) {
          outputTypes.push(fnabi.outputs[i].type)
        }

        // decode data
        var decodedObj = ethJSABI.rawDecode(outputTypes, response)

        // format decoded data
        decodedObj = ethJSABI.stringify(outputTypes, decodedObj)
        for (i = 0; i < outputTypes.length; i++) {
          var name = fnabi.outputs[i].name
          if (name.length > 0) {
            decodedObj[i] = outputTypes[i] + ' ' + name + ': ' + decodedObj[i]
          } else {
            decodedObj[i] = outputTypes[i] + ': ' + decodedObj[i]
          }
        }

        return callback(null, decodedObj)
      } catch (e) {
        return callback('Failed to decode output: ' + e)
      }
    }
  }
}
