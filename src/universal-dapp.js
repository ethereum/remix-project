/* global prompt */

var $ = require('jquery');
var EthJSVM = require('ethereumjs-vm');
var ethJSUtil = require('ethereumjs-util');
var EthJSTX = require('ethereumjs-tx');
var ethJSABI = require('ethereumjs-abi');
var EthJSBlock = require('ethereumjs-block');
var BN = ethJSUtil.BN;

function UniversalDApp (contracts, options) {
  var self = this;

  self.options = options || {};
  self.$el = $('<div class="udapp" />');
  self.contracts = contracts;
  self.renderOutputModifier = options.renderOutputModifier || function (name, content) { return content; };

  self.web3 = options.web3;

  if (options.mode === 'vm') {
    // FIXME: use `options.vm` or `self.vm` consistently
    options.vm = true;

    self.accounts = {};

    self.vm = new EthJSVM(null, null, { activatePrecompiles: true, enableHomestead: true });

    self.addAccount('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511');
    self.addAccount('2ac6c190b09897cd8987869cc7b918cfea07ee82038d492abce033c75c1b1d0c');
  } else if (options.mode !== 'web3') {
    throw new Error('Either VM or Web3 mode must be selected');
  }
}

UniversalDApp.prototype.addAccount = function (privateKey, balance) {
  var self = this;

  if (self.accounts) {
    privateKey = new Buffer(privateKey, 'hex');
    var address = ethJSUtil.privateToAddress(privateKey);

    // FIXME: we don't care about the callback, but we should still make this proper
    self.vm.stateManager.putAccountBalance(address, balance || 'f00000000000000001', function cb () {});

    self.accounts['0x' + address.toString('hex')] = { privateKey: privateKey, nonce: 0 };
  }
};

UniversalDApp.prototype.getAccounts = function (cb) {
  var self = this;

  if (!self.vm) {
    self.web3.eth.getAccounts(cb);
  } else {
    if (!self.accounts) {
      return cb('No accounts?');
    }

    cb(null, Object.keys(self.accounts));
  }
};

UniversalDApp.prototype.getBalance = function (address, cb) {
  var self = this;

  address = ethJSUtil.stripHexPrefix(address);

  if (!self.vm) {
    self.web3.eth.getBalance(address, function (err, res) {
      if (err) {
        cb(err);
      } else {
        cb(null, res.toString(10));
      }
    });
  } else {
    if (!self.accounts) {
      return cb('No accounts?');
    }

    self.vm.stateManager.getAccountBalance(new Buffer(address, 'hex'), function (err, res) {
      if (err) {
        cb('Account not found');
      } else {
        cb(null, new BN(res).toString(10));
      }
    });
  }
};

UniversalDApp.prototype.render = function () {
  var self = this;

  if (self.contracts.length === 0) {
    self.$el.append(self.getABIInputForm());
  } else {
    for (var c in self.contracts) {
      var $contractEl = $('<div class="contract"/>');

      if (self.contracts[c].address) {
        self.getInstanceInterface(self.contracts[c], self.contracts[c].address, $contractEl);
      } else {
        var $title = $('<span class="title"/>').text(self.contracts[c].name);
        if (self.contracts[c].bytecode) {
          $title.append($('<div class="size"/>').text((self.contracts[c].bytecode.length / 2) + ' bytes'));
        }
        $contractEl.append($title).append(self.getCreateInterface($contractEl, self.contracts[c]));
      }
      self.$el.append(self.renderOutputModifier(self.contracts[c].name, $contractEl));
    }
  }
  var $legend = $('<div class="legend" />')
    .append($('<div class="attach"/>').text('Attach'))
    .append($('<div class="transact"/>').text('Transact'))
    .append($('<div class="call"/>').text('Call'));

  self.$el.append($('<div class="poweredBy" />')
    .html('<a href="http://github.com/d11e9/universal-dapp">Universal ÐApp</a> powered by The Blockchain'));

  self.$el.append($legend);
  return self.$el;
};

UniversalDApp.prototype.getContractByName = function (contractName) {
  var self = this;
  for (var c in self.contracts) {
    if (self.contracts[c].name === contractName) {
      return self.contracts[c];
    }
  }
  return null;
};

UniversalDApp.prototype.getABIInputForm = function (cb) {
  var self = this;
  var $el = $('<div class="udapp-setup" />');
  var $jsonInput = $('<textarea class="json" placeholder=\'[ { "name": name, "bytecode": bytecode, "interface": abi }, { ... } ]\'/>');
  var $createButton = $('<button class="udapp-create"/>').text('Create a Universal ÐApp');
  $createButton.click(function (ev) {
    var contracts = $.parseJSON($jsonInput.val());
    if (cb) {
      var err = null;
      var dapp = null;
      try {
        dapp = new UniversalDApp(contracts, self.options);
      } catch (e) {
        err = e;
      }
      cb(err, dapp);
    } else {
      self.contracts = contracts;
      self.$el.empty().append(self.render());
    }
  });
  $el.append($jsonInput).append($createButton);
  return $el;
};

UniversalDApp.prototype.getCreateInterface = function ($container, contract) {
  var self = this;
  var $createInterface = $('<div class="create"/>');
  if (self.options.removable) {
    var $close = $('<div class="udapp-close" />');
    $close.click(function () { self.$el.remove(); });
    $createInterface.append($close);
  }
  var $newButton = self.getInstanceInterface(contract);
  var $atButton = $('<button class="atAddress"/>').text('At Address').click(function () { self.clickContractAt(self, $container.find('.createContract'), contract); });
  $createInterface.append($atButton).append($newButton);
  return $createInterface;
};

UniversalDApp.prototype.getInstanceInterface = function (contract, address, $target) {
  var self = this;
  var abi = JSON.parse(contract.interface).sort(function (a, b) {
    if (a.name > b.name) {
      return -1;
    } else {
      return 1;
    }
  }).sort(function (a, b) {
    if (a.constant === true) {
      return -1;
    } else {
      return 1;
    }
  });
  var funABI = self.getConstructorInterface(abi);
  var $createInterface = $('<div class="createContract"/>');

  var appendFunctions = function (address, $el) {
    var $instance = $('<div class="instance"/>');
    if (self.options.removable_instances) {
      var $close = $('<div class="udapp-close" />');
      $close.click(function () { $instance.remove(); });
      $instance.append($close);
    }
    var context = self.options.vm ? 'memory' : 'blockchain';

    address = (address.slice(0, 2) === '0x' ? '' : '0x') + address.toString('hex');
    var $title = $('<span class="title"/>').text(contract.name + ' at ' + address + ' (' + context + ')');
    $title.click(function () {
      $instance.toggleClass('hide');
    });

    var $events = $('<div class="events"/>');

    var parseLogs = function (err, response) {
      if (err) {
        return;
      }

      var $event = $('<div class="event" />');

      var $close = $('<div class="udapp-close" />');
      $close.click(function () { $event.remove(); });

      $event.append($('<span class="name"/>').text(response.event))
        .append($('<span class="args" />').text(JSON.stringify(response.args, null, 2)))
        .append($close);

      $events.append($event);
    };

    if (self.options.vm) {
      // FIXME: support indexed events
      var eventABI = {};

      $.each(abi, function (i, funABI) {
        if (funABI.type !== 'event') {
          return;
        }

        var hash = ethJSABI.eventID(funABI.name, funABI.inputs.map(function (item) { return item.type; }));
        eventABI[hash.toString('hex')] = { event: funABI.name, inputs: funABI.inputs };
      });

      self.vm.on('afterTx', function (response) {
        for (var i in response.vm.logs) {
          // [address, topics, mem]
          var log = response.vm.logs[i];
          var abi = eventABI[log[1][0].toString('hex')];
          var event = abi.event;
          var decoded;

          try {
            var types = abi.inputs.map(function (item) {
              return item.type;
            });
            decoded = ethJSABI.rawDecode(types, log[2]);
            decoded = ethJSABI.stringify(types, decoded);
          } catch (e) {
            decoded = '0x' + log[2].toString('hex');
          }

          parseLogs(null, { event: event, args: decoded });
        }
      });
    } else {
      var eventFilter = self.web3.eth.contract(abi).at(address).allEvents();
      eventFilter.watch(parseLogs);
    }
    $instance.append($title);

    // Add the fallback function
    $instance.append(self.getCallButton({
      abi: { constant: false, inputs: [], name: '(fallback)', outputs: [], type: 'function' },
      encode: function (args) {
        return '';
      },
      address: address
    }));

    $.each(abi, function (i, funABI) {
      if (funABI.type !== 'function') {
        return;
      }
      // @todo getData cannot be used with overloaded functions
      $instance.append(self.getCallButton({
        abi: funABI,
        encode: function (args) {
          var types = [];
          for (var i = 0; i < funABI.inputs.length; i++) {
            types.push(funABI.inputs[i].type);
          }

          return Buffer.concat([ ethJSABI.methodID(funABI.name, types), ethJSABI.rawEncode(types, args) ]).toString('hex');
        },
        address: address
      }));
    });
    ($el || $createInterface).append($instance.append($events));
  };

  if (!address || !$target) {
    $createInterface.append(self.getCallButton({
      abi: funABI,
      encode: function (args) {
        var types = [];
        for (var i = 0; i < funABI.inputs.length; i++) {
          types.push(funABI.inputs[i].type);
        }

        // NOTE: the caller will concatenate the bytecode and this
        //       it could be done here too for consistency
        return ethJSABI.rawEncode(types, args).toString('hex');
      },
      contractName: contract.name,
      bytecode: contract.bytecode,
      appendFunctions: appendFunctions
    }));
  } else {
    appendFunctions(address, $target);
  }

  return $createInterface;
};

UniversalDApp.prototype.getConstructorInterface = function (abi) {
  var funABI = { 'name': '', 'inputs': [], 'type': 'constructor', 'outputs': [] };
  for (var i = 0; i < abi.length; i++) {
    if (abi[i].type === 'constructor') {
      funABI.inputs = abi[i].inputs || [];
      break;
    }
  }
  return funABI;
};

UniversalDApp.prototype.getCallButton = function (args) {
  var self = this;
  // args.abi, args.encode, args.bytecode [constr only], args.address [fun only]
  // args.contractName [constr only], args.appendFunctions [constr only]
  var isConstructor = args.bytecode !== undefined;
  var lookupOnly = (args.abi.constant && !isConstructor);

  var inputs = '';
  $.each(args.abi.inputs, function (i, inp) {
    if (inputs !== '') {
      inputs += ', ';
    }
    inputs += inp.type + ' ' + inp.name;
  });
  var inputField = $('<input/>').attr('placeholder', inputs).attr('title', inputs);
  var $outputOverride = $('<div class="value" />');
  var outputSpan = $('<div class="output"/>');

  var getReturnOutput = function (result) {
    var returnName = lookupOnly ? 'Value' : 'Result';
    var returnCls = lookupOnly ? 'value' : 'returned';
    return $('<div class="' + returnCls + '">').html('<strong>' + returnName + ':</strong> ' + JSON.stringify(result, null, 2));
  };

  var getGasUsedOutput = function (result, vmResult) {
    var $gasUsed = $('<div class="gasUsed">');
    var caveat = lookupOnly ? '<em>(<span class="caveat" title="Cost only applies when called by a contract">caveat</span>)</em>' : '';
    var gas;
    if (result.gasUsed) {
      gas = result.gasUsed.toString(10);
      $gasUsed.html('<strong>Transaction cost:</strong> ' + gas + ' gas. ' + caveat);
    }
    if (vmResult && vmResult.gasUsed) {
      var $callGasUsed = $('<div class="gasUsed">');
      gas = vmResult.gasUsed.toString(10);
      $callGasUsed.append('<strong>Execution cost:</strong> ' + gas + ' gas.');
      $gasUsed.append($callGasUsed);
    }
    return $gasUsed;
  };

  var getDecodedOutput = function (result) {
    var $decoded;
    if (Array.isArray(result)) {
      $decoded = $('<ol>');
      for (var i = 0; i < result.length; i++) {
        $decoded.append($('<li>').text(result[i]));
      }
    } else {
      $decoded = result;
    }
    return $('<div class="decoded">').html('<strong>Decoded:</strong> ').append($decoded);
  };

  var getOutput = function () {
    var $result = $('<div class="result" />');
    var $close = $('<div class="udapp-close" />');
    $close.click(function () { $result.remove(); });
    $result.append($close);
    return $result;
  };
  var clearOutput = function ($result) {
    $(':not(.udapp-close)', $result).remove();
  };
  var replaceOutput = function ($result, message) {
    clearOutput($result);
    $result.append(message);
  };

  var handleCallButtonClick = function (ev, $result) {
    if (!$result) {
      $result = getOutput();
      if (lookupOnly && !inputs.length) {
        $outputOverride.empty().append($result);
      } else {
        outputSpan.append($result);
      }
    }

    var funArgs = '';
    try {
      funArgs = $.parseJSON('[' + inputField.val() + ']');
    } catch (e) {
      replaceOutput($result, $('<span/>').text('Error encoding arguments: ' + e));
      return;
    }
    var data = '';
    if (!isConstructor || funArgs.length > 0) {
      try {
        data = args.encode(funArgs);
      } catch (e) {
        replaceOutput($result, $('<span/>').text('Error encoding arguments: ' + e));
        return;
      }
    }
    if (data.slice(0, 9) === 'undefined') {
      data = data.slice(9);
    }
    if (data.slice(0, 2) === '0x') {
      data = data.slice(2);
    }

    replaceOutput($result, $('<span>Waiting for transaction to be mined...</span>'));

    if (isConstructor) {
      if (args.bytecode.indexOf('_') >= 0) {
        replaceOutput($result, $('<span>Deploying and linking required libraries...</span>'));
        self.linkBytecode(args.contractName, function (err, bytecode) {
          if (err) {
            replaceOutput($result, $('<span/>').text('Error deploying required libraries: ' + err));
          } else {
            args.bytecode = bytecode;
            handleCallButtonClick(ev, $result);
          }
        });
        return;
      } else {
        data = args.bytecode + data;
      }
    }

    var decodeResponse = function (response) {
      // Only decode if there supposed to be fields
      if (args.abi.outputs.length > 0) {
        try {
          var i;

          var outputTypes = [];
          for (i = 0; i < args.abi.outputs.length; i++) {
            outputTypes.push(args.abi.outputs[i].type);
          }

          // decode data
          var decodedObj = ethJSABI.rawDecode(outputTypes, response);

          // format decoded data
          decodedObj = ethJSABI.stringify(outputTypes, decodedObj);
          for (i = 0; i < outputTypes.length; i++) {
            var name = args.abi.outputs[i].name;
            if (name.length > 0) {
              decodedObj[i] = outputTypes[i] + ' ' + name + ': ' + decodedObj[i];
            } else {
              decodedObj[i] = outputTypes[i] + ': ' + decodedObj[i];
            }
          }

          return getDecodedOutput(decodedObj);
        } catch (e) {
          return getDecodedOutput('Failed to decode output: ' + e);
        }
      }
    };

    var decoded;
    self.runTx(data, args, function (err, result) {
      if (err) {
        replaceOutput($result, $('<span/>').text(err).addClass('error'));
      // VM only
      } else if (self.options.vm && result.vm.exception && result.vm.exceptionError) {
        replaceOutput($result, $('<span/>').text('VM Exception: ' + result.vm.exceptionError).addClass('error'));
      // VM only
      } else if (self.options.vm && result.vm.return === undefined) {
        replaceOutput($result, $('<span/>').text('Exception during execution.').addClass('error'));
      } else if (isConstructor) {
        replaceOutput($result, getGasUsedOutput(result, result.vm));
        args.appendFunctions(self.options.vm ? result.createdAddress : result.contractAddress);
      } else if (self.options.vm) {
        var outputObj = '0x' + result.vm.return.toString('hex');
        clearOutput($result);
        $result.append(getReturnOutput(outputObj)).append(getGasUsedOutput(result, result.vm));

        decoded = decodeResponse(result.vm.return);
        if (decoded) {
          $result.append(decoded);
        }
      } else if (args.abi.constant && !isConstructor) {
        clearOutput($result);
        $result.append(getReturnOutput(result)).append(getGasUsedOutput({}));

        decoded = decodeResponse(ethJSUtil.toBuffer(result));
        if (decoded) {
          $result.append(decoded);
        }
      } else {
        clearOutput($result);
        $result.append(getReturnOutput(result)).append(getGasUsedOutput(result));
      }
    });
  };

  var button = $('<button />')
    .addClass('call')
    .attr('title', args.abi.name)
    .text(args.bytecode ? 'Create' : args.abi.name)
    .click(handleCallButtonClick);

  if (lookupOnly && !inputs.length) {
    handleCallButtonClick();
  }

  var $contractProperty = $('<div class="contractProperty"/>');
  $contractProperty
    .toggleClass('constant', !isConstructor && args.abi.constant)
    .toggleClass('hasArgs', args.abi.inputs.length > 0)
    .toggleClass('constructor', isConstructor)
    .append(button)
    .append((lookupOnly && !inputs.length) ? $outputOverride : inputField);
  return $contractProperty.append(outputSpan);
};

UniversalDApp.prototype.linkBytecode = function (contractName, cb) {
  var self = this;
  var bytecode = self.getContractByName(contractName).bytecode;
  if (bytecode.indexOf('_') < 0) {
    return cb(null, bytecode);
  }
  var m = bytecode.match(/__([^_]{1,36})__/);
  if (!m) {
    return cb('Invalid bytecode format.');
  }
  var libraryName = m[1];
  if (!self.getContractByName(libraryName)) {
    return cb('Library ' + libraryName + ' not found.');
  }
  self.deployLibrary(libraryName, function (err, address) {
    if (err) {
      return cb(err);
    }
    var libLabel = '__' + libraryName + Array(39 - libraryName.length).join('_');
    var hexAddress = address.toString('hex');
    if (hexAddress.slice(0, 2) === '0x') {
      hexAddress = hexAddress.slice(2);
    }
    hexAddress = Array(40 - hexAddress.length + 1).join('0') + hexAddress;
    while (bytecode.indexOf(libLabel) >= 0) {
      bytecode = bytecode.replace(libLabel, hexAddress);
    }
    self.getContractByName(contractName).bytecode = bytecode;
    self.linkBytecode(contractName, cb);
  });
};

UniversalDApp.prototype.deployLibrary = function (contractName, cb) {
  var self = this;
  if (self.getContractByName(contractName).address) {
    return cb(null, self.getContractByName(contractName).address);
  }
  var bytecode = self.getContractByName(contractName).bytecode;
  if (bytecode.indexOf('_') >= 0) {
    self.linkBytecode(contractName, function (err, bytecode) {
      if (err) cb(err);
      else self.deployLibrary(contractName, cb);
    });
  } else {
    self.runTx(bytecode, { abi: { constant: false }, bytecode: bytecode }, function (err, result) {
      if (err) {
        return cb(err);
      }
      var address = self.options.vm ? result.createdAddress : result.contractAddress;
      self.getContractByName(contractName).address = address;
      cb(err, address);
    });
  }
};

UniversalDApp.prototype.clickContractAt = function (self, $output, contract) {
  var address = prompt('What Address is this contract at in the Blockchain? ie: 0xdeadbeaf...');
  self.getInstanceInterface(contract, address, $output);
};

function tryTillResponse (web3, txhash, done) {
  web3.eth.getTransactionReceipt(txhash, function (err, address) {
    if (!err && !address) {
      // Try again with a bit of delay
      setTimeout(function () { tryTillResponse(web3, txhash, done); }, 500);
    } else {
      done(err, address);
    }
  });
}

UniversalDApp.prototype.runTx = function (data, args, cb) {
  var self = this;
  var to = args.address;
  var constant = args.abi.constant;
  var isConstructor = args.bytecode !== undefined;
  if (data.slice(0, 2) !== '0x') {
    data = '0x' + data;
  }

  var gas = self.options.getGas ? self.options.getGas : 1000000;

  var value = 0;
  if (self.options.getValue) {
    try {
      value = self.options.getValue();
    } catch (e) {
      return cb(e);
    }
  }

  var tx;
  if (!self.vm) {
    tx = {
      from: self.options.getAddress ? self.options.getAddress() : self.web3.eth.accounts[0],
      to: to,
      data: data,
      value: value
    };
    if (constant && !isConstructor) {
      self.web3.eth.call(tx, cb);
    } else {
      self.web3.eth.estimateGas(tx, function (err, resp) {
        if (err) {
          return cb(err, resp);
        }

        if (resp > gas) {
          return cb('Gas required exceeds limit: ' + resp);
        }

        tx.gas = resp;

        self.web3.eth.sendTransaction(tx, function (err, resp) {
          if (err) {
            return cb(err, resp);
          }

          tryTillResponse(self.web3, resp, cb);
        });
      });
    }
  } else {
    try {
      var address = self.options.getAddress ? self.options.getAddress() : self.getAccounts()[0];
      var account = self.accounts[address];
      tx = new EthJSTX({
        nonce: new Buffer([account.nonce++]), // @todo count beyond 255
        gasPrice: 1,
        gasLimit: 3000000000, // plenty
        to: to,
        value: new BN(value, 10),
        data: new Buffer(data.slice(2), 'hex')
      });
      tx.sign(account.privateKey);
      var block = new EthJSBlock({
        header: {
          // FIXME: support coinbase, difficulty, number and gasLimit
          timestamp: new Date().getTime() / 1000 | 0
        },
        transactions: [],
        uncleHeaders: []
      });
      self.vm.runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}, cb);
    } catch (e) {
      cb(e, null);
    }
  }
};

module.exports = UniversalDApp;
