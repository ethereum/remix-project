'use strict'
import * as solcTranslate from 'solc/translate'
import { execution } from '@remix-project/remix-lib'

const txHelper = execution.txHelper

export function parseContracts (contractName, contract, source) {
  const detail: Record<string, any> = {}

  detail.name = contractName
  detail.metadata = contract.metadata
  if (contract.evm.bytecode.object) {
    detail.bytecode = contract.evm.bytecode.object
  }

  detail.abi = contract.abi
  detail.storageLayout = contract.storageLayout

  if (contract.evm.bytecode.object) {
    detail.bytecode = contract.evm.bytecode
    detail.web3Deploy = gethDeploy(contractName.toLowerCase(), contract.abi, contract.evm.bytecode.object)

    detail.metadataHash = retrieveMetadataHash(contract.evm.bytecode.object)
    if (detail.metadataHash) {
      detail.swarmLocation = 'bzzr://' + detail.metadataHash
    }
  }

  detail.functionHashes = {}
  for (const fun in contract.evm.methodIdentifiers) {
    detail.functionHashes[contract.evm.methodIdentifiers[fun]] = fun
  }

  detail.gasEstimates = formatGasEstimates(contract.evm.gasEstimates)

  detail.devdoc = contract.devdoc
  detail.userdoc = contract.userdoc

  if (contract.evm.deployedBytecode && contract.evm.deployedBytecode.object.length > 0) {
    detail['Runtime Bytecode'] = contract.evm.deployedBytecode
  }

  if (source && contract.assembly !== null) {
    detail.Assembly = solcTranslate.prettyPrintLegacyAssemblyJSON(contract.evm.legacyAssembly, source.content)
  }

  return detail
}

const retrieveMetadataHash = function (bytecode) {
  let match = /a165627a7a72305820([0-9a-f]{64})0029$/.exec(bytecode)
  if (!match) {
    match = /a265627a7a72305820([0-9a-f]{64})6c6578706572696d656e74616cf50037$/.exec(bytecode)
  }
  if (match) {
    return match[1]
  }
}

const gethDeploy = function (contractName, jsonInterface, bytecode) {
  let code = ''
  const funABI = txHelper.getConstructorInterface(jsonInterface)

  funABI.inputs.forEach(function (inp) {
    code += 'var ' + inp.name + ' = /* var of type ' + inp.type + ' here */ ;\n'
  })

  contractName = contractName.replace(/[:./]/g, '_')
  code += 'var ' + contractName + 'Contract = new web3.eth.Contract(' + JSON.stringify(jsonInterface).replace('\n', '') + ');' +
    '\nvar ' + contractName + ' = ' + contractName + 'Contract.deploy({' +
  "\n     data: '0x" + bytecode + "', " +
    '\n     arguments: ['

  funABI.inputs.forEach(function (inp) {
    code += '\n          ' + inp.name + ','
  })

  code += '\n     ]' +
    '\n}).send({' +
    '\n     from: web3.eth.accounts[0], ' +
    "\n     gas: '4700000'" +
    '\n   }, function (e, contract){' +
    '\n    console.log(e, contract);' +
    "\n    if (typeof contract.address !== 'undefined') {" +
    "\n         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);" +
    '\n    }' +
    '\n })'

  return code
}

const formatGasEstimates = function (data) {
  if (!data) return {}
  if (data.creation === undefined && data.external === undefined && data.internal === undefined) return {}

  const gasToText = function (g) {
    return g === null ? 'unknown' : g
  }

  const ret: Record<string, any> = {}
  let fun
  if ('creation' in data) {
    ret.Creation = data.creation
  }

  if ('external' in data) {
    ret.External = {}
    for (fun in data.external) {
      ret.External[fun] = gasToText(data.external[fun])
    }
  }

  if ('internal' in data) {
    ret.Internal = {}
    for (fun in data.internal) {
      ret.Internal[fun] = gasToText(data.internal[fun])
    }
  }
  return ret
}
