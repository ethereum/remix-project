var $ = require('jquery')
var yo = require('yo-yo')
var ethJSUtil = require('ethereumjs-util')
var Personal = require('web3-eth-personal')
var css = require('../styles/run-tab-styles')
var executionContext = require('../../../execution-context')
var copyToClipboard = require('../../ui/copy-to-clipboard')
var modalDialogCustom = require('../../ui/modal-dialog-custom')
var addTooltip = require('../../ui/tooltip')
var modalCustom = require('../../ui/modal-dialog-custom')
var tootip = require('../../ui/tooltip')
var helper = require('../../../lib/helper.js')

function settings (container, self) {
  // VARIABLES
  var net = yo`<span class=${css.network}></span>`
  var networkcallid = 0
  const updateNetwork = (cb) => {
    networkcallid++
    (function (callid) {
      executionContext.detectNetwork((err, { id, name } = {}) => {
        if (networkcallid > callid) return
        networkcallid++
        if (err) {
          console.error(err)
          net.innerHTML = 'can\'t detect network '
        } else {
          net.innerHTML = `<i class="${css.networkItem} fa fa-plug" aria-hidden="true"></i> ${name} (${id || '-'})`
        }
        if (cb) cb(err, {id, name})
      })
    })(networkcallid)
  }
  var environmentEl = yo`
    <div class="${css.crow}">
      <div id="selectExEnv" class="${css.col1_1}">
        Environment
      </div>
      <div class=${css.environment}>
        ${net}
        <select id="selectExEnvOptions" onchange=${() => { updateNetwork() }} class="${css.select}">
          <option id="vm-mode"
            title="Execution environment does not connect to any node, everything is local and in memory only."
            value="vm" checked name="executionContext"> JavaScript VM
          </option>
          <option id="injected-mode"
            title="Execution environment has been provided by Metamask or similar provider."
            value="injected" checked name="executionContext"> Injected Web3
          </option>
          <option id="web3-mode"
            title="Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse!
            If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."
            value="web3" name="executionContext"> Web3 Provider
          </option>
        </select>
        <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md" target="_blank"><i class="${css.icon} fa fa-info"></i></a>
      </div>
    </div>
  `
  var accountEl = yo`
    <div class="${css.crow}">
      <div class="${css.col1_1}">
        Account
        <i class="fa fa-plus-circle ${css.icon}" aria-hidden="true" onclick=${newAccount} title="Create a new account"></i>
      </div>
      <div class=${css.account}>
        <select name="txorigin" class="${css.select}" id="txorigin"></select>
        ${copyToClipboard(() => document.querySelector('#runTabView #txorigin').value)}
        <i class="fa fa-pencil-square-o ${css.icon}" aria-hiden="true" onclick=${signMessage} title="Sign a message using this account key"></i>
      </div>
    </div>
  `
  var gasPriceEl = yo`
    <div class="${css.crow}">
      <div class="${css.col1_1}">Gas limit</div>
      <input type="number" class="${css.col2}" id="gasLimit" value="3000000">
    </div>
  `
  var valueEl = yo`
    <div class="${css.crow}">
      <div class="${css.col1_1}">Value</div>
      <input type="text" class="${css.col2_1}" id="value" value="0" title="Enter the value and choose the unit">
      <select name="unit" class="${css.col2_2}" id="unit">
        <option data-unit="wei">wei</option>
        <option data-unit="gwei">gwei</option>
        <option data-unit="finney">finney</option>
        <option data-unit="ether">ether</option>
      </select>
    </div>
  `
  // DOM ELEMENT
  var el = yo`
    <div class="${css.settings}">
      ${environmentEl}
      ${accountEl}
      ${gasPriceEl}
      ${valueEl}
    </div>
  `
  // HELPER FUNCTIONS AND EVENTS
  self._deps.udapp.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
    if (error) return
    if (!lookupOnly) el.querySelector('#value').value = '0'
    updateAccountBalances(container, self)
  })

  // DROPDOWN
  var selectExEnv = environmentEl.querySelector('#selectExEnvOptions')

  function setFinalContext () {
    // set the final context. Cause it is possible that this is not the one we've originaly selected
    selectExEnv.value = executionContext.getProvider()
    self.event.trigger('clearInstance', [])
    updateNetwork()
    fillAccountsList(el, self)
  }

  self.event.register('clearInstance', () => {
    var instanceContainer = self._view.instanceContainer
    var instanceContainerTitle = self._view.instanceContainerTitle
    instanceContainer.innerHTML = '' // clear the instances list
    instanceContainer.appendChild(instanceContainerTitle)
    instanceContainer.appendChild(self._view.noInstancesText)
  })

  executionContext.event.register('addProvider', (network) => {
    selectExEnv.appendChild(yo`<option
            title="Manually added environment: ${network.url}"
            value="${network.name}" name="executionContext"> ${network.name}
          </option>`)
    tootip(`${network.name} [${network.url}] added`)
  })

  executionContext.event.register('removeProvider', (name) => {
    var env = selectExEnv.querySelector(`option[value="${name}"]`)
    if (env) {
      selectExEnv.removeChild(env)
      tootip(`${name} removed`)
    }
  })

  selectExEnv.addEventListener('change', function (event) {
    let context = selectExEnv.options[selectExEnv.selectedIndex].value
    executionContext.executionContextChange(context, null, () => {
      modalDialogCustom.confirm(null, 'Are you sure you want to connect to an ethereum node?', () => {
        modalDialogCustom.prompt(null, 'Web3 Provider Endpoint', 'http://localhost:8545', (target) => {
          executionContext.setProviderFromEndpoint(target, context, (alertMsg) => {
            if (alertMsg) {
              modalDialogCustom.alert(alertMsg)
            }
            setFinalContext()
          })
        }, setFinalContext)
      }, setFinalContext)
    }, (alertMsg) => {
      modalDialogCustom.alert(alertMsg)
    }, setFinalContext)
  })

  selectExEnv.value = executionContext.getProvider()
  executionContext.event.register('contextChanged', (context, silent) => {
    setFinalContext()
  })

  setInterval(() => {
    updateNetwork()
    fillAccountsList(el, self)
  }, 5000)

  setInterval(() => {
    updateAccountBalances(container, self)
  }, 10000)

  function newAccount () {
    self._deps.udapp.newAccount('',
      (cb) => {
        modalCustom.promptPassphraseCreation((error, passphrase) => {
          if (error) {
            return modalCustom.alert(error)
          }
          cb(passphrase)
        }, () => {})
      },
      (error, address) => {
        if (!error) {
          addTooltip(`account ${address} created`)
        } else {
          addTooltip('Cannot create an account: ' + error)
        }
      }
    )
  }
  function signMessage (event) {
    self._deps.udapp.getAccounts((err, accounts) => {
      if (err) { addTooltip(`Cannot get account list: ${err}`) }
      var signMessageDialog = { 'title': 'Sign a message', 'text': 'Enter a message to sign', 'inputvalue': 'Message to sign' }
      var $txOrigin = container.querySelector('#txorigin')
      var account = $txOrigin.selectedOptions[0].value
      var isVM = executionContext.isVM()
      var isInjected = executionContext.getProvider() === 'injected'
      function alertSignedData (error, hash, signedData) {
        if (error && error.message !== '') {
          console.log(error)
          addTooltip(error.message)
        } else {
          modalDialogCustom.alert(yo`<div><b>hash:</b>${hash}<br><b>signature:</b>${signedData}</div>`)
        }
      }
      if (isVM) {
        modalDialogCustom.promptMulti(signMessageDialog, (message) => {
          const personalMsg = ethJSUtil.hashPersonalMessage(Buffer.from(message))
          var privKey = self._deps.udapp.accounts[account].privateKey
          try {
            var rsv = ethJSUtil.ecsign(personalMsg, privKey)
            var signedData = ethJSUtil.toRpcSig(rsv.v, rsv.r, rsv.s)
            alertSignedData(null, '0x' + personalMsg.toString('hex'), signedData)
          } catch (e) {
            addTooltip(e.message)
            return
          }
        }, false)
      } else if (isInjected) {
        modalDialogCustom.promptMulti(signMessageDialog, (message) => {
          const hashedMsg = executionContext.web3().sha3(message)
          try {
            executionContext.web3().eth.sign(account, hashedMsg, (error, signedData) => {
              alertSignedData(error, hashedMsg, signedData)
            })
          } catch (e) {
            addTooltip(e.message)
            console.log(e)
            return
          }
        })
      } else {
        modalDialogCustom.promptPassphrase('Passphrase to sign a message', 'Enter your passphrase for this account to sign the message', '', (passphrase) => {
          modalDialogCustom.promptMulti(signMessageDialog, (message) => {
            const hashedMsg = executionContext.web3().sha3(message)
            try {
              var personal = new Personal(executionContext.web3().currentProvider)
              personal.sign(hashedMsg, account, passphrase, (error, signedData) => {
                alertSignedData(error, hashedMsg, signedData)
              })
            } catch (e) {
              addTooltip(e.message)
              console.log(e)
              return
            }
          })
        }, false)
      }
    })
  }

  return el
}

var accountListCallId = 0
var loadedAccounts = {}
function fillAccountsList (container, self) {
  accountListCallId++
  (function (callid) {
    var txOrigin = container.querySelector('#txorigin')
    self._deps.udapp.getAccounts((err, accounts) => {
      if (accountListCallId > callid) return
      accountListCallId++
      if (err) { addTooltip(`Cannot get account list: ${err}`) }
      for (var loadedaddress in loadedAccounts) {
        if (accounts.indexOf(loadedaddress) === -1) {
          txOrigin.removeChild(txOrigin.querySelector('option[value="' + loadedaddress + '"]'))
          delete loadedAccounts[loadedaddress]
        }
      }
      for (var i in accounts) {
        var address = accounts[i]
        if (!loadedAccounts[address]) {
          txOrigin.appendChild(yo`<option value="${address}" >${address}</option>`)
          loadedAccounts[address] = 1
        }
      }
      txOrigin.setAttribute('value', accounts[0])
    })
  })(accountListCallId)
}

function updateAccountBalances (container, self) {
  var accounts = $(container.querySelector('#txorigin')).children('option')
  accounts.each(function (index, value) {
    (function (acc) {
      self._deps.udapp.getBalanceInEther(accounts[acc].value, function (err, res) {
        if (!err) {
          accounts[acc].innerText = helper.shortenAddress(accounts[acc].value, res)
        }
      })
    })(index)
  })
}

module.exports = settings
