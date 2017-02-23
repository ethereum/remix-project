/* global prompt */
'use strict'

var $ = require('jquery')
var ethJSUtil = require('ethereumjs-util')
var ethJSABI = require('ethereumjs-abi')
var BN = ethJSUtil.BN
var EventManager = require('./lib/eventManager')
var crypto = require('crypto')
var async = require('async')
var TxRunner = require('./app/txRunner')

/*
  trigger debugRequested
*/
function UniversalDApp (executionContext, options) {
  this.event = new EventManager()
  var self = this

  self.options = options || {}
  self.$el = $('<div class="udapp" />')
  self.personalMode = self.options.personalMode || false
  self.contracts
  self.transactionContextAPI
  var defaultRenderOutputModifier = function (name, content) { return content }
  self.renderOutputModifier = defaultRenderOutputModifier
  self.web3 = executionContext.web3()
  self.vm = executionContext.vm()
  self.executionContext = executionContext
  self.executionContext.event.register('contextChanged', this, function (context) {
    self.reset(self.contracts)
  })
  self.txRunner = new TxRunner(executionContext, {}, {
    queueTxs: true,
    personalMode: this.personalMode
  })
}

UniversalDApp.prototype.reset = function (contracts, transactionContextAPI, renderer) {
  this.$el.empty()
  this.contracts = contracts
  this.transactionContextAPI = transactionContextAPI
  this.renderOutputModifier = renderer
  this.accounts = {}
  if (this.executionContext.isVM()) {
    this._addAccount('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511')
    this._addAccount('2ac6c190b09897cd8987869cc7b918cfea07ee82038d492abce033c75c1b1d0c')
    this._addAccount('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a')
    this._addAccount('d74aa6d18aa79a05f3473dd030a97d3305737cbc8337d940344345c1f6b72eea')
    this._addAccount('71975fbf7fe448e004ac7ae54cad0a383c3906055a65468714156a07385e96ce')
  }
  this.txRunner = new TxRunner(this.executionContext, this.accounts, {
    queueTxs: true,
    personalMode: this.personalMode
  })
}

UniversalDApp.prototype.newAccount = function (password, cb) {
  if (!this.executionContext.isVM()) {
    if (!this.personalMode) {
      return cb('Not running in personal mode')
    }
    this.web3.personal.newAccount(password, cb)
  } else {
    var privateKey
    do {
      privateKey = crypto.randomBytes(32)
    } while (!ethJSUtil.isValidPrivate(privateKey))
    this._addAccount(privateKey)
    cb(null, '0x' + ethJSUtil.privateToAddress(privateKey))
  }
}

UniversalDApp.prototype._addAccount = function (privateKey, balance) {
  var self = this

  if (!self.executionContext.isVM()) {
    throw new Error('_addAccount() cannot be called in non-VM mode')
  }

  if (self.accounts) {
    privateKey = new Buffer(privateKey, 'hex')
    var address = ethJSUtil.privateToAddress(privateKey)

    // FIXME: we don't care about the callback, but we should still make this proper
    self.vm.stateManager.putAccountBalance(address, balance || 'f00000000000000001', function cb () {})

    self.accounts['0x' + address.toString('hex')] = { privateKey: privateKey, nonce: 0 }
  }
}

UniversalDApp.prototype.getAccounts = function (cb) {
  var self = this

  if (!self.executionContext.isVM()) {
    // Weirdness of web3: listAccounts() is sync, `getListAccounts()` is async
    // See: https://github.com/ethereum/web3.js/issues/442
    if (self.personalMode) {
      self.web3.personal.getListAccounts(cb)
    } else {
      self.web3.eth.getAccounts(cb)
    }
  } else {
    if (!self.accounts) {
      return cb('No accounts?')
    }

    cb(null, Object.keys(self.accounts))
  }
}

UniversalDApp.prototype.getBalance = function (address, cb) {
  var self = this

  address = ethJSUtil.stripHexPrefix(address)

  if (!self.executionContext.isVM()) {
    self.web3.eth.getBalance(address, function (err, res) {
      if (err) {
        cb(err)
      } else {
        cb(null, res.toString(10))
      }
    })
  } else {
    if (!self.accounts) {
      return cb('No accounts?')
    }

    self.vm.stateManager.getAccountBalance(new Buffer(address, 'hex'), function (err, res) {
      if (err) {
        cb('Account not found')
      } else {
        cb(null, new BN(res).toString(10))
      }
    })
  }
}

UniversalDApp.prototype.render = function () {
  var self = this

  // NOTE: don't display anything if there are no contracts to display
  if (self.contracts.length === 0) {
    return self.$el
  }

  var $legend = $('<div class="legend" />')
    .append($('<div class="publish"/>').text('Publish'))
    .append($('<div class="attach"/>').text('Attach'))
    .append($('<div class="transact"/>').text('Transact'))
    .append($('<div class="payable"/>').text('Transact (Payable)'))
    .append($('<div class="call"/>').text('Call'))

  self.$el.append($legend)

  for (var c in self.contracts) {
    var $contractEl = $('<div class="contract"/>')

    if (self.contracts[c].address) {
      self.getInstanceInterface(self.contracts[c], self.contracts[c].address, $contractEl)
    } else {
      var $title = $('<span class="title"/>').text(self.contracts[c].name)
      if (self.contracts[c].bytecode) {
        $title.append($('<div class="size"/>').text((self.contracts[c].bytecode.length / 2) + ' bytes'))
      }
      $contractEl.append($title).append(self.getCreateInterface($contractEl, self.contracts[c]))
    }
    self.$el.append(self.renderOutputModifier(self.contracts[c].name, $contractEl))
  }

  return self.$el
}

UniversalDApp.prototype.getContractByName = function (contractName) {
  var self = this
  for (var c in self.contracts) {
    if (self.contracts[c].name === contractName) {
      return self.contracts[c]
    }
  }
  return null
}

UniversalDApp.prototype.getCreateInterface = function ($container, contract) {
  var self = this
  var $createInterface = $('<div class="create"/>')
  if (self.options.removable) {
    var $close = $('<div class="udapp-close" />')
    $close.click(function () { self.$el.remove() })
    $createInterface.append($close)
  }

  var $publishButton = $('<button class="publishContract"/>').text('Publish').click(function () { self.event.trigger('publishContract', [contract]) })
  $createInterface.append($publishButton)

  var $atButton = $('<button class="atAddress"/>').text('At Address').click(function () { self.clickContractAt(self, $container.find('.createContract'), contract) })
  $createInterface.append($atButton)

  var $newButton = self.getInstanceInterface(contract)
  if (!$newButton) {
    return $createInterface
  }

  $createInterface.append($newButton)

  // Only display creation interface for non-abstract contracts.
  // FIXME: maybe have a flag for this in the JSON?
  // FIXME: maybe fix getInstanceInterface() below for this case
  if (contract.bytecode.length === 0) {
    var $createButton = $newButton.find('.constructor .call')

    // NOTE: we must show the button to have CSS properly lined up
    $createButton.text('Create')
    $createButton.attr('disabled', 'disabled')
    $createButton.attr('title', 'This contract does not implement all functions and thus cannot be created.')
  }

  if (contract.metadata.length === 0) {
    $publishButton.attr('disabled', 'disabled')
    $publishButton.attr('title', 'This contract does not implement all functions and thus cannot be published.')
  }

  return $createInterface
}

UniversalDApp.prototype.getInstanceInterface = function (contract, address, $target) {
  var self = this
  var abi = JSON.parse(contract.interface).sort(function (a, b) {
    if (a.name > b.name) {
      return -1
    } else {
      return 1
    }
  }).sort(function (a, b) {
    if (a.constant === true) {
      return -1
    } else {
      return 1
    }
  })

  var funABI = self.getConstructorInterface(abi)
  if (!funABI) {
    return
  }

  var $createInterface = $('<div class="createContract"/>')

  var appendFunctions = function (address, $el) {
    var $instance = $('<div class="instance"/>')
    if (self.options.removable_instances) {
      var $close = $('<div class="udapp-close" />')
      $close.click(function () { $instance.remove() })
      $instance.append($close)
    }
    var context = self.executionContext.isVM() ? 'memory' : 'blockchain'

    address = (address.slice(0, 2) === '0x' ? '' : '0x') + address.toString('hex')
    var $title = $('<span class="title"/>').text(contract.name + ' at ' + address + ' (' + context + ')')
    $title.click(function () {
      $instance.toggleClass('hide')
    })

    var $events = $('<div class="events"/>')

    var parseLogs = function (err, response) {
      if (err) {
        return
      }

      var $event = $('<div class="event" />')

      var $close = $('<div class="udapp-close" />')
      $close.click(function () { $event.remove() })

      $event.append($('<span class="name"/>').text(response.event))
        .append($('<span class="args" />').text(JSON.stringify(response.args, null, 2)))
        .append($close)

      $events.append($event)
    }

    if (self.executionContext.isVM()) {
      // FIXME: support indexed events
      var eventABI = {}

      $.each(abi, function (i, funABI) {
        if (funABI.type !== 'event') {
          return
        }

        var hash = ethJSABI.eventID(funABI.name, funABI.inputs.map(function (item) { return item.type }))
        eventABI[hash.toString('hex')] = { event: funABI.name, inputs: funABI.inputs }
      })

      self.vm.on('afterTx', function (response) {
        for (var i in response.vm.logs) {
          // [address, topics, mem]
          var log = response.vm.logs[i]
          var event
          var decoded

          try {
            var abi = eventABI[log[1][0].toString('hex')]
            event = abi.event
            var types = abi.inputs.map(function (item) {
              return item.type
            })
            decoded = ethJSABI.rawDecode(types, log[2])
            decoded = ethJSABI.stringify(types, decoded)
          } catch (e) {
            decoded = '0x' + log[2].toString('hex')
          }

          parseLogs(null, { event: event, args: decoded })
        }
      })
    } else {
      var eventFilter = self.web3.eth.contract(abi).at(address).allEvents()
      eventFilter.watch(parseLogs)
    }
    $instance.append($title)

    // Add the fallback function
    var fallback = self.getFallbackInterface(abi)
    if (fallback) {
      $instance.append(self.getCallButton({
        abi: fallback,
        encode: function (args) {
          return ''
        },
        address: address
      }))
    }

    $.each(abi, function (i, funABI) {
      if (funABI.type !== 'function') {
        return
      }
      // @todo getData cannot be used with overloaded functions
      $instance.append(self.getCallButton({
        abi: funABI,
        encode: function (args) {
          var types = []
          for (var i = 0; i < funABI.inputs.length; i++) {
            types.push(funABI.inputs[i].type)
          }

          return Buffer.concat([ ethJSABI.methodID(funABI.name, types), ethJSABI.rawEncode(types, args) ]).toString('hex')
        },
        address: address
      }))
    })

    $el = $el || $createInterface
    $el.append($instance.append($events))
  }

  if (!address || !$target) {
    $createInterface.append(self.getCallButton({
      abi: funABI,
      encode: function (args) {
        var types = []
        for (var i = 0; i < funABI.inputs.length; i++) {
          types.push(funABI.inputs[i].type)
        }

        // NOTE: the caller will concatenate the bytecode and this
        //       it could be done here too for consistency
        return ethJSABI.rawEncode(types, args).toString('hex')
      },
      contractName: contract.name,
      bytecode: contract.bytecode,
      appendFunctions: appendFunctions
    }))
  } else {
    appendFunctions(address, $target)
  }

  return $createInterface
}

UniversalDApp.prototype.getConstructorInterface = function (abi) {
  for (var i = 0; i < abi.length; i++) {
    if (abi[i].type === 'constructor') {
      return abi[i]
    }
  }

  return { 'type': 'constructor', 'payable': false, 'inputs': [] }
}

UniversalDApp.prototype.getFallbackInterface = function (abi) {
  for (var i = 0; i < abi.length; i++) {
    if (abi[i].type === 'fallback') {
      return abi[i]
    }
  }
}

UniversalDApp.prototype.getCallButton = function (args) {
  var self = this
  // args.abi, args.encode, args.bytecode [constr only], args.address [fun only]
  // args.contractName [constr only], args.appendFunctions [constr only]
  var isConstructor = args.bytecode !== undefined
  var lookupOnly = (args.abi.constant && !isConstructor)

  var inputs = ''
  if (args.abi.inputs) {
    $.each(args.abi.inputs, function (i, inp) {
      if (inputs !== '') {
        inputs += ', '
      }
      inputs += inp.type + ' ' + inp.name
    })
  }
  var inputField = $('<input/>').attr('placeholder', inputs).attr('title', inputs)
  var $outputOverride = $('<div class="value" />')
  var outputSpan = $('<div class="output"/>')

  var getReturnOutput = function (result) {
    var returnName = lookupOnly ? 'Value' : 'Result'
    var returnCls = lookupOnly ? 'value' : 'returned'
    return $('<div class="' + returnCls + '">').html('<strong>' + returnName + ':</strong> ' + JSON.stringify(result, null, 2))
  }

  var getDebugTransaction = function (result) {
    var $debugTx = $('<div class="debugTx">')
    var $button = $('<button title="Launch Debugger" class="debug"><i class="fa fa-bug"></i></button>')
    $button.click(function () {
      self.event.trigger('debugRequested', [result])
    })
    $debugTx.append($button)
    return $debugTx
  }

  var getDebugCall = function (result) {
    var $debugTx = $('<div class="debugCall">')
    var $button = $('<button title="Launch Debugger" class="debug"><i class="fa fa-bug"></i></button>')
    $button.click(function () {
      self.event.trigger('debugRequested', [result])
    })
    $debugTx.append($button)
    return $debugTx
  }

  var getGasUsedOutput = function (result, vmResult) {
    var $gasUsed = $('<div class="gasUsed">')
    var caveat = lookupOnly ? '<em>(<span class="caveat" title="Cost only applies when called by a contract">caveat</span>)</em>' : ''
    var gas
    if (result.gasUsed) {
      gas = result.gasUsed.toString(10)
      $gasUsed.html('<strong>Transaction cost:</strong> ' + gas + ' gas. ' + caveat)
    }
    if (vmResult && vmResult.gasUsed) {
      var $callGasUsed = $('<div class="gasUsed">')
      gas = vmResult.gasUsed.toString(10)
      $callGasUsed.append('<strong>Execution cost:</strong> ' + gas + ' gas.')
      $gasUsed.append($callGasUsed)
    }
    return $gasUsed
  }

  var getDecodedOutput = function (result) {
    var $decoded
    if (Array.isArray(result)) {
      $decoded = $('<ol>')
      for (var i = 0; i < result.length; i++) {
        $decoded.append($('<li>').text(result[i]))
      }
    } else {
      $decoded = result
    }
    return $('<div class="decoded">').html('<strong>Decoded:</strong> ').append($decoded)
  }

  var getOutput = function () {
    var $result = $('<div class="result" />')
    var $close = $('<div class="udapp-close" />')
    $close.click(function () { $result.remove() })
    $result.append($close)
    return $result
  }
  var clearOutput = function ($result) {
    $(':not(.udapp-close)', $result).remove()
  }
  var replaceOutput = function ($result, message) {
    clearOutput($result)
    $result.append(message)
  }

  var handleCallButtonClick = function (ev, $result) {
    if (!$result) {
      $result = getOutput()
      if (lookupOnly && !inputs.length) {
        $outputOverride.empty().append($result)
      } else {
        outputSpan.append($result)
      }
    }

    var funArgs = ''
    try {
      funArgs = $.parseJSON('[' + inputField.val() + ']')
    } catch (e) {
      replaceOutput($result, $('<span/>').text('Error encoding arguments: ' + e))
      return
    }
    var data = ''
    if (!isConstructor || funArgs.length > 0) {
      try {
        data = args.encode(funArgs)
      } catch (e) {
        replaceOutput($result, $('<span/>').text('Error encoding arguments: ' + e))
        return
      }
    }
    if (data.slice(0, 9) === 'undefined') {
      data = data.slice(9)
    }
    if (data.slice(0, 2) === '0x') {
      data = data.slice(2)
    }

    replaceOutput($result, $('<span>Waiting for transaction to be mined...</span>'))

    if (isConstructor) {
      if (args.bytecode.indexOf('_') >= 0) {
        replaceOutput($result, $('<span>Deploying and linking required libraries...</span>'))
        self.linkBytecode(args.contractName, function (err, bytecode) {
          if (err) {
            replaceOutput($result, $('<span/>').text('Error deploying required libraries: ' + err))
          } else {
            args.bytecode = bytecode
            handleCallButtonClick(ev, $result)
          }
        })
        return
      } else {
        data = args.bytecode + data
      }
    }

    var decodeResponse = function (response) {
      // Only decode if there supposed to be fields
      if (args.abi.outputs && args.abi.outputs.length > 0) {
        try {
          var i

          var outputTypes = []
          for (i = 0; i < args.abi.outputs.length; i++) {
            outputTypes.push(args.abi.outputs[i].type)
          }

          // decode data
          var decodedObj = ethJSABI.rawDecode(outputTypes, response)

          // format decoded data
          decodedObj = ethJSABI.stringify(outputTypes, decodedObj)
          for (i = 0; i < outputTypes.length; i++) {
            var name = args.abi.outputs[i].name
            if (name.length > 0) {
              decodedObj[i] = outputTypes[i] + ' ' + name + ': ' + decodedObj[i]
            } else {
              decodedObj[i] = outputTypes[i] + ': ' + decodedObj[i]
            }
          }

          return getDecodedOutput(decodedObj)
        } catch (e) {
          return getDecodedOutput('Failed to decode output: ' + e)
        }
      }
    }

    var decoded
    self.runTx({ to: args.address, data: data, useCall: lookupOnly }, function (err, txResult) {
      if (!txResult) {
        replaceOutput($result, $('<span/>').text('callback contain no result ' + err).addClass('error'))
        return
      }
      var result = txResult.result
      if (err) {
        replaceOutput($result, $('<span/>').text(err).addClass('error'))
      // VM only
      } else if (self.executionContext.isVM() && result.vm.exception === 0 && result.vm.exceptionError) {
        replaceOutput($result, $('<span/>').text('VM Exception: ' + result.vm.exceptionError).addClass('error'))
        $result.append(getDebugTransaction(txResult))
      // VM only
      } else if (self.executionContext.isVM() && result.vm.return === undefined) {
        replaceOutput($result, $('<span/>').text('Exception during execution.').addClass('error'))
        $result.append(getDebugTransaction(txResult))
      } else if (isConstructor) {
        replaceOutput($result, getGasUsedOutput(result, result.vm))
        $result.append(getDebugTransaction(txResult))
        args.appendFunctions(self.executionContext.isVM() ? result.createdAddress : result.contractAddress)
      } else if (self.executionContext.isVM()) {
        var outputObj = '0x' + result.vm.return.toString('hex')
        clearOutput($result)
        $result.append(getReturnOutput(outputObj)).append(getGasUsedOutput(result, result.vm))

        decoded = decodeResponse(result.vm.return)
        if (decoded) {
          $result.append(decoded)
        }
        if (lookupOnly) {
          $result.append(getDebugCall(txResult))
        } else {
          $result.append(getDebugTransaction(txResult))
        }
      } else if (lookupOnly) {
        clearOutput($result)
        $result.append(getReturnOutput(result)).append(getGasUsedOutput({}))

        decoded = decodeResponse(ethJSUtil.toBuffer(result))
        if (decoded) {
          $result.append(decoded)
        }
      } else {
        clearOutput($result)
        $result.append(getReturnOutput(result)).append(getGasUsedOutput(result))
        $result.append(getDebugTransaction(txResult))
      }
    })
  }

  var title
  if (isConstructor) {
    title = 'Create'
  } else if (args.abi.name) {
    title = args.abi.name
  } else {
    title = '(fallback)'
  }

  var button = $('<button />')
    .addClass('call')
    .attr('title', title)
    .text(title)
    .click(handleCallButtonClick)

  if (lookupOnly && !inputs.length) {
    handleCallButtonClick()
  }

  var $contractProperty = $('<div class="contractProperty"/>')
  $contractProperty
    .append(button)
    .append((lookupOnly && !inputs.length) ? $outputOverride : inputField)

  if (isConstructor) {
    $contractProperty.addClass('constructor')
  }

  if (lookupOnly) {
    $contractProperty.addClass('constant')
  }

  if (args.abi.inputs && args.abi.inputs.length > 0) {
    $contractProperty.addClass('hasArgs')
  }

  if (args.abi.payable === true) {
    $contractProperty.addClass('payable')
  }

  return $contractProperty.append(outputSpan)
}

UniversalDApp.prototype.linkBytecode = function (contractName, cb) {
  var self = this
  var bytecode = self.getContractByName(contractName).bytecode
  if (bytecode.indexOf('_') < 0) {
    return cb(null, bytecode)
  }
  var m = bytecode.match(/__([^_]{1,36})__/)
  if (!m) {
    return cb('Invalid bytecode format.')
  }
  var libraryName = m[1]
  if (!self.getContractByName(libraryName)) {
    return cb('Library ' + libraryName + ' not found.')
  }
  self.deployLibrary(libraryName, function (err, address) {
    if (err) {
      return cb(err)
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
    self.getContractByName(contractName).bytecode = bytecode
    self.linkBytecode(contractName, cb)
  })
}

UniversalDApp.prototype.deployLibrary = function (contractName, cb) {
  var self = this
  if (self.getContractByName(contractName).address) {
    return cb(null, self.getContractByName(contractName).address)
  }
  var bytecode = self.getContractByName(contractName).bytecode
  if (bytecode.indexOf('_') >= 0) {
    self.linkBytecode(contractName, function (err, bytecode) {
      if (err) cb(err)
      else self.deployLibrary(contractName, cb)
    })
  } else {
    self.runTx({ data: bytecode, useCall: false }, function (err, txResult) {
      if (err) {
        return cb(err)
      }
      var address = self.executionContext.isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
      self.getContractByName(contractName).address = address
      cb(err, address)
    })
  }
}

UniversalDApp.prototype.clickContractAt = function (self, $output, contract) {
  var address = prompt('What Address is this contract at in the Blockchain? ie: 0xdeadbeaf...')
  self.getInstanceInterface(contract, address, $output)
}

UniversalDApp.prototype.runTx = function (args, cb) {
  var self = this
  var tx = {
    to: args.to,
    data: args.data,
    useCall: args.useCall
  }
  async.waterfall([
    // query gas limit
    function (callback) {
      tx.gasLimit = 3000000

      if (self.transactionContextAPI.getGasLimit) {
        self.transactionContextAPI.getGasLimit(function (err, ret) {
          if (err) {
            return callback(err)
          }

          tx.gasLimit = ret
          callback()
        })
      } else {
        callback()
      }
    },
    // query value
    function (callback) {
      tx.value = 0

      if (self.transactionContextAPI.getValue) {
        self.transactionContextAPI.getValue(function (err, ret) {
          if (err) {
            return callback(err)
          }

          tx.value = ret
          callback()
        })
      } else {
        callback()
      }
    },
    // query address
    function (callback) {
      if (self.transactionContextAPI.getAddress) {
        self.transactionContextAPI.getAddress(function (err, ret) {
          if (err) {
            return callback(err)
          }

          tx.from = ret

          callback()
        })
      } else {
        self.getAccounts(function (err, ret) {
          if (err) {
            return callback(err)
          }

          if (ret.length === 0) {
            return callback('No accounts available')
          }

          if (self.executionContext.isVM() && !self.accounts[ret[0]]) {
            return callback('Invalid account selected')
          }

          tx.from = ret[0]

          callback()
        })
      }
    },
    // run transaction
    function (callback) {
      self.txRunner.rawRun(tx, function (error, result) { callback(error, result) })
    }
  ], cb)
}

module.exports = UniversalDApp
