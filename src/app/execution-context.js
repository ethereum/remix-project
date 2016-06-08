/* global confirm */

var $ = require('jquery');
var Web3 = require('web3');

var injectedProvider;

if (typeof web3 !== 'undefined') {
  injectedProvider = web3.currentProvider;
  web3 = new Web3(injectedProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

function ExecutionContext (compiler) {
  var executionContext = injectedProvider ? 'injected' : 'vm';

  this.isVM = function () {
    return executionContext === 'vm';
  };

  this.web3 = function () {
    return web3;
  };

  var $injectedToggle = $('#injected-mode');
  var $vmToggle = $('#vm-mode');
  var $web3Toggle = $('#web3-mode');
  var $web3endpoint = $('#web3Endpoint');

  if (web3.providers && web3.currentProvider instanceof web3.providers.IpcProvider) {
    $web3endpoint.val('ipc');
  }

  setExecutionContextRadio();

  $injectedToggle.on('change', executionContextChange);
  $vmToggle.on('change', executionContextChange);
  $web3Toggle.on('change', executionContextChange);
  $web3endpoint.on('change', function () {
    setProviderFromEndpoint();
    if (executionContext === 'web3') {
      compiler.compile();
    }
  });

  function executionContextChange (ev) {
    if (ev.target.value === 'web3' && !confirm('Are you sure you want to connect to a local ethereum node?')) {
      setExecutionContextRadio();
    } else if (ev.target.value === 'injected' && injectedProvider === undefined) {
      setExecutionContextRadio();
    } else {
      executionContext = ev.target.value;
      if (executionContext === 'web3') {
        setProviderFromEndpoint();
      } else if (executionContext === 'injected') {
        web3.setProvider(injectedProvider);
      }
    }
    compiler.compile();
  }

  function setProviderFromEndpoint () {
    var endpoint = $web3endpoint.val();
    if (endpoint === 'ipc') {
      web3.setProvider(new web3.providers.IpcProvider());
    } else {
      web3.setProvider(new web3.providers.HttpProvider(endpoint));
    }
  }

  function setExecutionContextRadio () {
    if (executionContext === 'injected') {
      $injectedToggle.get(0).checked = true;
    } else if (executionContext === 'vm') {
      $vmToggle.get(0).checked = true;
    } else if (executionContext === 'web3') {
      $web3Toggle.get(0).checked = true;
    }
  }
}

module.exports = ExecutionContext;
