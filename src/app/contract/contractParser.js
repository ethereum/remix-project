'use strict'

var $ = require('jquery')
var txHelper = require('../execution/txHelper')

module.exports = (contractName, contract, compiledSource) => {
  return getDetails(contractName, contract, compiledSource)
}

var getDetails = function (contractName, contract, source) {
  var detail = {}
  detail.name = contractName
  detail.metadata = contract.metadata
  if (contract.bytecode) {
    detail.bytecode = contract.bytecode
  }

  detail.interface = contract.interface

  if (contract.bytecode) {
    detail.bytecode = contract.bytecode
    detail.web3Deploy = gethDeploy(contractName.toLowerCase(), contract['interface'], contract.bytecode)

    detail.metadataHash = retrieveMetadataHash(contract.bytecode)
    if (detail.metadataHash) {
      detail.swarmLocation = 'bzzr://' + detail.metadataHash
    }
  }

  detail.functionHashes = {}
  for (var fun in contract.functionHashes) {
    detail.functionHashes[contract.functionHashes[fun]] = fun
  }

  detail.gasEstimates = formatGasEstimates(contract.gasEstimates)

  if (contract.runtimeBytecode && contract.runtimeBytecode.length > 0) {
    detail['Runtime Bytecode'] = contract.runtimeBytecode
  }

  if (contract.opcodes !== undefined && contract.opcodes !== '') {
    detail['Opcodes'] = contract.opcodes
  }

  if (contract.assembly !== null) {
    detail['Assembly'] = formatAssemblyText(contract.assembly, '', source)
  }

  return detail
}

var retrieveMetadataHash = function (bytecode) {
  var match = /a165627a7a72305820([0-9a-f]{64})0029$/.exec(bytecode)
  if (match) {
    return match[1]
  }
}

var formatAssemblyText = function (asm, prefix, source) {
  if (typeof asm === typeof '' || asm === null || asm === undefined) {
    return prefix + asm + '\n'
  }
  var text = prefix + '.code\n'
  $.each(asm['.code'], function (i, item) {
    var v = item.value === undefined ? '' : item.value
    var src = ''
    if (item.begin !== undefined && item.end !== undefined) {
      src = source.slice(item.begin, item.end).replace('\n', '\\n', 'g')
    }
    if (src.length > 30) {
      src = src.slice(0, 30) + '...'
    }
    if (item.name !== 'tag') {
      text += '  '
    }
    text += prefix + item.name + ' ' + v + '\t\t\t' + src + '\n'
  })
  text += prefix + '.data\n'
  if (asm['.data']) {
    $.each(asm['.data'], function (i, item) {
      text += '  ' + prefix + '' + i + ':\n'
      text += formatAssemblyText(item, prefix + '    ', source)
    })
  }
  return text
}

var gethDeploy = function (contractName, jsonInterface, bytecode) {
  var code = ''
  var funABI = txHelper.getConstructorInterface(JSON.parse(jsonInterface))

  funABI.inputs.forEach(function (inp) {
    code += 'var ' + inp.name + ' = /* var of type ' + inp.type + ' here */ ;\n'
  })

  contractName = contractName.replace(/[:./]/g, '_')
  code += 'var ' + contractName + 'Contract = web3.eth.contract(' + jsonInterface.replace('\n', '') + ');' +
    '\nvar ' + contractName + ' = ' + contractName + 'Contract.new('

  funABI.inputs.forEach(function (inp) {
    code += '\n   ' + inp.name + ','
  })

  code += '\n   {' +
    '\n     from: web3.eth.accounts[0], ' +
    "\n     data: '0x" + bytecode + "', " +
    "\n     gas: '4700000'" +
    '\n   }, function (e, contract){' +
    '\n    console.log(e, contract);' +
    "\n    if (typeof contract.address !== 'undefined') {" +
    "\n         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);" +
    '\n    }' +
    '\n })'

  return code
}

var formatGasEstimates = function (data) {
  // FIXME: the whole gasEstimates object should be nil instead
  if (data.creation === undefined && data.external === undefined && data.internal === undefined) {
    return
  }

  var gasToText = function (g) {
    return g === null ? 'unknown' : g
  }

  var ret = {}
  var fun
  if ('creation' in data) {
    ret['Creation'] = gasToText(data.creation[0]) + ' + ' + gasToText(data.creation[1]) + '\n'
  }

  if ('external' in data) {
    ret['External'] = {}
    for (fun in data.external) {
      ret['External'][fun] = gasToText(data.external[fun])
    }
  }

  if ('internal' in data) {
    ret['Internal'] = {}
    for (fun in data.internal) {
      ret['Internal'][fun] = gasToText(data.internal[fun])
    }
  }
  return ret
}
