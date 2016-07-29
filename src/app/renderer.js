var $ = require('jquery');

var UniversalDApp = require('../universal-dapp.js');

var utils = require('./utils');

function Renderer (editor, executionContext, updateFiles, transactionDebugger) {
  var detailsOpen = {};

  function renderError (message, container, noAnnotations) {
    var type = utils.errortype(message);
    var $pre = $('<pre />').text(message);
    var $error = $('<div class="sol ' + type + '"><div class="close"><i class="fa fa-close"></i></div></div>').prepend($pre);
    if (container === undefined) {
      container = $('#output');
    }
    container.append($error);
    var err = message.match(/^([^:]*):([0-9]*):(([0-9]*):)? /);
    if (err) {
      var errFile = err[1];
      var errLine = parseInt(err[2], 10) - 1;
      var errCol = err[4] ? parseInt(err[4], 10) : 0;
      if (!noAnnotations && (errFile === '' || errFile === utils.fileNameFromKey(editor.getCacheFile()))) {
        editor.addAnnotation({
          row: errLine,
          column: errCol,
          text: message,
          type: type
        });
      }
      $error.click(function (ev) {
        if (errFile !== '' && errFile !== utils.fileNameFromKey(editor.getCacheFile()) && editor.hasFile(errFile)) {
          // Switch to file
          editor.setCacheFile(utils.fileKey(errFile));
          updateFiles();
        // @TODO could show some error icon in files with errors
        }
        editor.handleErrorClick(errLine, errCol);
      });
      $error.find('.close').click(function (ev) {
        ev.preventDefault();
        $error.remove();
        return false;
      });
    }
  }
  this.error = renderError;

  var combined = function (contractName, jsonInterface, bytecode) {
    return JSON.stringify([{ name: contractName, interface: jsonInterface, bytecode: bytecode }]);
  };

  function renderContracts (data, source) {
    var udappContracts = [];
    for (var contractName in data.contracts) {
      var contract = data.contracts[contractName];
      udappContracts.push({
        name: contractName,
        interface: contract['interface'],
        bytecode: contract.bytecode
      });
    }

    var dapp = new UniversalDApp(udappContracts, {
      mode: executionContext.isVM() ? 'vm' : 'web3',
      web3: executionContext.web3(),
      removable: false,
      getAddress: function () { return $('#txorigin').val(); },
      getValue: function () {
        var comp = $('#value').val().split(' ');
        return executionContext.web3().toWei(comp[0], comp.slice(1).join(' '));
      },
      getGasLimit: function () { return $('#gasLimit').val(); },
      removable_instances: true,
      renderOutputModifier: function (contractName, $contractOutput) {
        var contract = data.contracts[contractName];
        if (contract.bytecode) {
          $contractOutput.append(textRow('Bytecode', contract.bytecode));
        }
        $contractOutput.append(textRow('Interface', contract['interface']));
        if (contract.bytecode) {
          $contractOutput.append(textRow('Web3 deploy', gethDeploy(contractName.toLowerCase(), contract['interface'], contract.bytecode), 'deploy'));
          $contractOutput.append(textRow('uDApp', combined(contractName, contract['interface'], contract.bytecode), 'deploy'));
        }
        return $contractOutput.append(getDetails(contract, source, contractName));
      }
    }, transactionDebugger);

    var $contractOutput = dapp.render();

    var $txOrigin = $('#txorigin');

    function renderAccounts (err, accounts) {
      if (err) {
        renderError(err.message);
      }
      if (accounts && accounts[0]) {
        $txOrigin.empty();
        for (var a in accounts) { $txOrigin.append($('<option />').val(accounts[a]).text(accounts[a])); }
        $txOrigin.val(accounts[0]);
      } else {
        $txOrigin.val('unknown');
      }
    }

    dapp.getAccounts(renderAccounts);

    $contractOutput.find('.title').click(function (ev) { $(this).closest('.contract').toggleClass('hide'); });
    $('#output').append($contractOutput);
    $('.col2 input,textarea').click(function () { this.select(); });
  }
  this.contracts = renderContracts;

  var tableRowItems = function (first, second, cls) {
    return $('<div class="crow"/>')
      .addClass(cls)
      .append($('<div class="col1">').append(first))
      .append($('<div class="col2">').append(second));
  };
  var tableRow = function (description, data) {
    return tableRowItems(
      $('<span/>').text(description),
      $('<input readonly="readonly"/>').val(data));
  };
  var textRow = function (description, data, cls) {
    return tableRowItems(
      $('<strong/>').text(description),
      $('<textarea readonly="readonly" class="gethDeployText"/>').val(data),
      cls);
  };

  var getDetails = function (contract, source, contractName) {
    var button = $('<button>Toggle Details</button>');
    var details = $('<div style="display: none;"/>')
      .append(tableRow('Solidity Interface', contract.solidity_interface));
    if (contract.opcodes !== '') {
      details.append(tableRow('Opcodes', contract.opcodes));
    }
    var funHashes = '';
    for (var fun in contract.functionHashes) {
      funHashes += contract.functionHashes[fun] + ' ' + fun + '\n';
    }
    details.append($('<span class="col1">Functions</span>'));
    details.append($('<pre/>').text(funHashes));
    var gasEstimates = formatGasEstimates(contract.gasEstimates);
    if (gasEstimates) {
      details.append($('<span class="col1">Gas Estimates</span>'));
      details.append($('<pre/>').text(gasEstimates));
    }
    if (contract.runtimeBytecode && contract.runtimeBytecode.length > 0) {
      details.append(tableRow('Runtime Bytecode', contract.runtimeBytecode));
    }
    if (contract.assembly !== null) {
      details.append($('<span class="col1">Assembly</span>'));
      var assembly = $('<pre/>').text(formatAssemblyText(contract.assembly, '', source));
      details.append(assembly);
    }
    button.click(function () { detailsOpen[contractName] = !detailsOpen[contractName]; details.toggle(); });
    if (detailsOpen[contractName]) {
      details.show();
    }
    return $('<div class="contractDetails"/>').append(button).append(details);
  };

  var formatGasEstimates = function (data) {
    // FIXME: the whole gasEstimates object should be nil instead
    if (data.creation === undefined && data.external === undefined && data.internal === undefined) {
      return;
    }
    var gasToText = function (g) { return g === null ? 'unknown' : g; };
    var text = '';
    var fun;
    if ('creation' in data) {
      text += 'Creation: ' + gasToText(data.creation[0]) + ' + ' + gasToText(data.creation[1]) + '\n';
    }

    if ('external' in data) {
      text += 'External:\n';
      for (fun in data.external) {
        text += '  ' + fun + ': ' + gasToText(data.external[fun]) + '\n';
      }
    }

    if ('internal' in data) {
      text += 'Internal:\n';
      for (fun in data.internal) {
        text += '  ' + fun + ': ' + gasToText(data.internal[fun]) + '\n';
      }
    }

    return text;
  };

  var formatAssemblyText = function (asm, prefix, source) {
    if (typeof asm === typeof '' || asm === null || asm === undefined) {
      return prefix + asm + '\n';
    }
    var text = prefix + '.code\n';
    $.each(asm['.code'], function (i, item) {
      var v = item.value === undefined ? '' : item.value;
      var src = '';
      if (item.begin !== undefined && item.end !== undefined) {
        src = source.slice(item.begin, item.end).replace('\n', '\\n', 'g');
      }
      if (src.length > 30) {
        src = src.slice(0, 30) + '...';
      }
      if (item.name !== 'tag') {
        text += '  ';
      }
      text += prefix + item.name + ' ' + v + '\t\t\t' + src + '\n';
    });
    text += prefix + '.data\n';
    if (asm['.data']) {
      $.each(asm['.data'], function (i, item) {
        text += '  ' + prefix + '' + i + ':\n';
        text += formatAssemblyText(item, prefix + '    ', source);
      });
    }

    return text;
  };

  function gethDeploy (contractName, jsonInterface, bytecode) {
    var code = '';
    var funABI = getConstructorInterface(JSON.parse(jsonInterface));

    funABI.inputs.forEach(function (inp) {
      code += 'var ' + inp.name + ' = /* var of type ' + inp.type + ' here */ ;\n';
    });

    code += 'var ' + contractName + 'Contract = web3.eth.contract(' + jsonInterface.replace('\n', '') + ');' +
      '\nvar ' + contractName + ' = ' + contractName + 'Contract.new(';

    funABI.inputs.forEach(function (inp) {
      code += '\n   ' + inp.name + ',';
    });

    code += '\n   {' +
      '\n     from: web3.eth.accounts[0], ' +
      '\n     data: \'' + bytecode + '\', ' +
      '\n     gas: 4700000' +
      '\n   }, function (e, contract){' +
      '\n    console.log(e, contract);' +
      '\n    if (typeof contract.address !== \'undefined\') {' +
      '\n         console.log(\'Contract mined! address: \' + contract.address + \' transactionHash: \' + contract.transactionHash);' +
      '\n    }' +
      '\n })';

    return code;
  }

  function getConstructorInterface (abi) {
    var funABI = { 'name': '', 'inputs': [], 'type': 'constructor', 'outputs': [] };
    for (var i = 0; i < abi.length; i++) {
      if (abi[i].type === 'constructor') {
        funABI.inputs = abi[i].inputs || [];
        break;
      }
    }
    return funABI;
  }
}

module.exports = Renderer;
