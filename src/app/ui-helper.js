'use strict'

var $ = require('jquery')

module.exports = {
  tableRowItems: function (first, second, cls) {
    return $('<div class="crow"/>')
      .addClass(cls)
      .append($('<div class="col1">').append(first))
      .append($('<div class="col2">').append(second))
  },

  tableRow: function (description, data) {
    return this.tableRowItems(
      $('<span/>').text(description),
      $('<input readonly="readonly"/>').val(data))
  },

  preRow: function (description, data) {
    return this.tableRowItems(
      $('<span/>').text(description),
      $('<pre/>').text(data)
    )
  },

  formatAssemblyText: function (asm, prefix, source) {
    var self = this
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
        text += self.formatAssemblyText(item, prefix + '    ', source)
      })
    }
    return text
  },

  gethDeploy: function (contractName, jsonInterface, bytecode) {
    var code = ''
    var funABI = this.getConstructorInterface(JSON.parse(jsonInterface))

    funABI.inputs.forEach(function (inp) {
      code += 'var ' + inp.name + ' = /* var of type ' + inp.type + ' here */ ;\n'
    })

    code += 'var ' + contractName + 'Contract = web3.eth.contract(' + jsonInterface.replace('\n', '') + ');' +
      '\nvar ' + contractName + ' = ' + contractName + 'Contract.new('

    funABI.inputs.forEach(function (inp) {
      code += '\n   ' + inp.name + ','
    })

    code += '\n   {' +
      '\n     from: web3.eth.accounts[0], ' +
      "\n     data: '" + bytecode + "', " +
      '\n     gas: 4700000' +
      '\n   }, function (e, contract){' +
      '\n    console.log(e, contract);' +
      "\n    if (typeof contract.address !== 'undefined') {" +
      "\n         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);" +
      '\n    }' +
      '\n })'

    return code
  },

  getConstructorInterface: function (abi) {
    var funABI = { 'name': '', 'inputs': [], 'type': 'constructor', 'outputs': [] }
    for (var i = 0; i < abi.length; i++) {
      if (abi[i].type === 'constructor') {
        funABI.inputs = abi[i].inputs || []
        break
      }
    }
    return funABI
  },

  formatGasEstimates: function (data) {
    // FIXME: the whole gasEstimates object should be nil instead
    if (data.creation === undefined && data.external === undefined && data.internal === undefined) {
      return
    }

    var gasToText = function (g) {
      return g === null ? 'unknown' : g
    }

    var text = ''
    var fun
    if ('creation' in data) {
      text += 'Creation: ' + gasToText(data.creation[0]) + ' + ' + gasToText(data.creation[1]) + '\n'
    }

    if ('external' in data) {
      text += 'External:\n'
      for (fun in data.external) {
        text += '  ' + fun + ': ' + gasToText(data.external[fun]) + '\n'
      }
    }

    if ('internal' in data) {
      text += 'Internal:\n'
      for (fun in data.internal) {
        text += '  ' + fun + ': ' + gasToText(data.internal[fun]) + '\n'
      }
    }
    return text
  },

  detailsOpen: {},
  getDetails: function (contract, source, contractName) {
    var button = $('<button>Toggle Details</button>')
    var details = $('<div style="display: none;"/>')

    var funHashes = ''
    for (var fun in contract.functionHashes) {
      funHashes += contract.functionHashes[fun] + ' ' + fun + '\n'
    }
    if (funHashes.length > 0) {
      details.append(this.preRow('Functions', funHashes))
    }

    var gasEstimates = this.formatGasEstimates(contract.gasEstimates)
    if (gasEstimates) {
      details.append(this.preRow('Gas Estimates', gasEstimates))
    }

    if (contract.runtimeBytecode && contract.runtimeBytecode.length > 0) {
      details.append(this.tableRow('Runtime Bytecode', contract.runtimeBytecode))
    }

    if (contract.opcodes !== undefined && contract.opcodes !== '') {
      details.append(this.tableRow('Opcodes', contract.opcodes))
    }

    if (contract.assembly !== null) {
      details.append(this.preRow('Assembly', this.formatAssemblyText(contract.assembly, '', source)))
    }

    var self = this
    button.click(function () {
      self.detailsOpen[contractName] = !self.detailsOpen[contractName]
      details.toggle()
    })
    if (this.detailsOpen[contractName]) {
      details.show()
    }
    return $('<div class="contractDetails"/>').append(button).append(details)
  }
}
