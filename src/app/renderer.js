'use strict'

var $ = require('jquery')

var utils = require('./utils')
var uiHelper = require('./ui-helper')

function Renderer (editor, updateFiles, udapp, executionContext, formalVerificationEvent, compilerEvent) {
  this.editor = editor
  this.updateFiles = updateFiles
  this.udapp = udapp
  this.executionContext = executionContext
  var self = this
  formalVerificationEvent.register('compilationFinished', this, function (success, message, container, options) {
    if (!success) {
      self.error(message, container, options)
    }
  })
  compilerEvent.register('compilationFinished', this, function (success, data, source) {
    $('#output').empty()
    if (success) {
      self.contracts(data, source)
    }

    // NOTE: still need to display as there might be warnings
    if (data['error']) {
      self.error(data['error'])
    }
    if (data['errors']) {
      data['errors'].forEach(function (err) {
        self.error(err)
      })
    }
  })
}

Renderer.prototype.error = function (message, container, options) {
  var self = this
  var opt = options || {}
  if (!opt.type) {
    opt.type = utils.errortype(message)
  }
  var $pre
  if (opt.isHTML) {
    $pre = $(opt.useSpan ? '<span />' : '<pre />').html(message)
  } else {
    $pre = $(opt.useSpan ? '<span />' : '<pre />').text(message)
  }
  var $error = $('<div class="sol ' + opt.type + '"><div class="close"><i class="fa fa-close"></i></div></div>').prepend($pre)
  if (container === undefined) {
    container = $('#output')
  }
  container.append($error)
  var err = message.match(/^([^:]*):([0-9]*):(([0-9]*):)? /)
  if (err) {
    var errFile = err[1]
    var errLine = parseInt(err[2], 10) - 1
    var errCol = err[4] ? parseInt(err[4], 10) : 0
    if (!opt.noAnnotations && (errFile === '' || errFile === utils.fileNameFromKey(self.editor.getCacheFile()))) {
      self.editor.addAnnotation({
        row: errLine,
        column: errCol,
        text: message,
        type: opt.type
      })
    }
    $error.click(function (ev) {
      if (errFile !== '' && errFile !== utils.fileNameFromKey(self.editor.getCacheFile()) && self.editor.hasFile(errFile)) {
        // Switch to file
        self.editor.setCacheFile(utils.fileKey(errFile))
        self.updateFiles()
      }
      self.editor.handleErrorClick(errLine, errCol)
    })
  }
  $error.find('.close').click(function (ev) {
    ev.preventDefault()
    $error.remove()
    return false
  })
}

Renderer.prototype.contracts = function (data, source) {
  var udappContracts = []
  for (var contractName in data.contracts) {
    var contract = data.contracts[contractName]
    udappContracts.push({
      name: contractName,
      interface: contract['interface'],
      bytecode: contract.bytecode
    })
  }

  var retrieveMetadataHash = function (bytecode) {
    var match = /a165627a7a72305820([0-9a-f]{64})0029$/.exec(bytecode)
    if (match) {
      return match[1]
    }
  }

  var renderOutputModifier = function (contractName, $contractOutput) {
    var contract = data.contracts[contractName]
    if (contract.bytecode) {
      $contractOutput.append(uiHelper.tableRow('Bytecode', contract.bytecode))
    }

    $contractOutput.append(uiHelper.tableRow('Interface', contract['interface']))

    if (contract.bytecode) {
      $contractOutput.append(uiHelper.preRow('Web3 deploy', uiHelper.gethDeploy(contractName.toLowerCase(), contract['interface'], contract.bytecode), 'deploy'))

      // check if there's a metadata hash appended
      var metadataHash = retrieveMetadataHash(contract.bytecode)
      if (metadataHash) {
        $contractOutput.append(uiHelper.tableRow('Metadata location', 'bzzr://' + metadataHash))
      }
    }

    var ctrSource = getSource(contractName, source, data)
    return $contractOutput.append(uiHelper.getDetails(contract, ctrSource, contractName))
  }

  var self = this

  var getSource = function (contractName, source, data) {
    var currentFile = utils.fileNameFromKey(self.editor.getCacheFile())
    return source.sources[currentFile]
  }

  var getAddress = function (cb) {
    cb(null, $('#txorigin').val())
  }

  var getValue = function (cb) {
    try {
      var comp = $('#value').val().split(' ')
      cb(null, self.executionContext.web3().toWei(comp[0], comp.slice(1).join(' ')))
    } catch (e) {
      cb(e)
    }
  }

  var getGasLimit = function (cb) {
    cb(null, $('#gasLimit').val())
  }

  this.udapp.reset(udappContracts, getAddress, getValue, getGasLimit, renderOutputModifier)

  var $contractOutput = this.udapp.render()

  var $txOrigin = $('#txorigin')

  this.udapp.getAccounts(function (err, accounts) {
    if (err) {
      self.error(err.message)
    }
    if (accounts && accounts[0]) {
      $txOrigin.empty()
      for (var a in accounts) { $txOrigin.append($('<option />').val(accounts[a]).text(accounts[a])) }
      $txOrigin.val(accounts[0])
    } else {
      $txOrigin.val('unknown')
    }
  })

  $contractOutput.find('.title').click(function (ev) { $(this).closest('.contract').toggleClass('hide') })
  $('#output').append($contractOutput)
  $('.col2 input,textarea').click(function () { this.select() })
}

module.exports = Renderer
