'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?plugins=solidity,udapp', false)
  },

  'Should execution a simple console command': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]', 10000)
      .executeScript('console.log(1 + 1)')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '2', 60000)
  },

  'Should clear console': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]')
      .journalChildIncludes('Welcome to Remix')
      .click('#clearConsole')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '', 60000)
  },

  'Should display auto-complete menu': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]')
      .click('*[data-id="terminalCli"]')
      .sendKeys('*[data-id="terminalCliInput"]', 'remix.')
      .assert.visible('*[data-id="autoCompletePopUpAutoCompleteItem"]')
  },

  'Should execute remix.help() command': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]')
      .executeScript('remix.help()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.loadgist(id)', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.loadurl(url)', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.execute(filepath)', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.exeCurrent()', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.help()', 60000)
  },

  'Async/Await Script': function (browser: NightwatchBrowser) {
    browser
      .addFile('asyncAwait.js', { content: asyncAwait })
      .openFile('asyncAwait.js')
      .executeScript('remix.execute(\'asyncAwait.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Waiting Promise', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'result - Promise Resolved', 60000)
  },

  'Call Remix File Manager from a script': function (browser: NightwatchBrowser) {
    browser
      .addFile('asyncAwaitWithFileManagerAccess.js', { content: asyncAwaitWithFileManagerAccess })
      .openFile('asyncAwaitWithFileManagerAccess.js')
      .pause(5000)
      .executeScript('remix.execute(\'asyncAwaitWithFileManagerAccess.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'contract Ballot {', 60000)
  },

  'Call web3.eth.getAccounts() using JavaScript VM': function (browser: NightwatchBrowser) {
    browser
      .executeScript('web3.eth.getAccounts()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '"0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", "0x617F2E2fD72FD9D5503197092aC168c91465E7f2", "0x17F6AD8Ef982297579C203069C1DbfFE4348c372", "0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C"', 80000)
  },

  'Call web3.eth.getAccounts() using Web3 Provider': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .clickLaunchIcon('udapp')
      .click('*[data-id="settingsWeb3Mode"]')
      .modalFooterOKClick()
      .executeScript('web3.eth.getAccounts()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '[ "', 60000) // we check if an array is present, don't need to check for the content
      .waitForElementContainsText('*[data-id="terminalJournal"]', '" ]', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', '", "', 60000)
  },

  'Call Remix File Resolver (external URL) from a script': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .addFile('resolveExternalUrlAndSave.js', { content: resolveExternalUrlAndSave })
      .openFile('resolveExternalUrlAndSave.js')
      .pause(1000)
      .executeScript('remix.execute(\'resolveExternalUrlAndSave.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Implementation of the {IERC20} interface.', 60000)
      .openFile('.deps/github/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol')
  },

  'Call Remix File Resolver (internal URL) from a script': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .addFile('resolveUrl.js', { content: resolveUrl })
      .openFile('resolveUrl.js')
      .pause(1000)
      .executeScript('remix.execute(\'resolveUrl.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'contract Ballot {', 60000)
  },

  'Call Remix File Resolver (internal URL) from a script and specify a path': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .addFile('resolveExternalUrlAndSaveToaPath.js', { content: resolveExternalUrlAndSaveToaPath })
      .openFile('resolveExternalUrlAndSaveToaPath.js')
      .pause(1000)
      .executeScript('remix.execute(\'resolveExternalUrlAndSaveToaPath.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'abstract contract ERC20Burnable', 60000)
      .openFile('.deps/github/newFile.sol')
  },

  'Deploy "Owner" using an ether.js script, listen to event and check event are logged in the terminal': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('settings')
      .clickLaunchIcon('udapp')
      .click('*[data-id="settingsVMLondonMode"]')
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .clickLaunchIcon('filePanel')
      .click('*[data-id="treeViewDivtreeViewItem"]') // make sure we create the file at the root folder
      .addFile('deployWithEthersJs.js', { content: deployWithEthersJs })
      .openFile('deployWithEthersJs.js')
      .pause(1000)
      .openFile('contracts/2_Owner.sol')
      .clickLaunchIcon('solidity')
      .click('*[data-id="compilerContainerCompileBtn"]') // compile Owner
      .executeScript('remix.execute(\'deployWithEthersJs.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Contract Address: 0xd9145CCE52D386f254917e481eB44e9943F39138', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Deployment successful.', 60000)
      .addAtAddressInstance('0xd9145CCE52D386f254917e481eB44e9943F39138', true, true)
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]', 60000)
      .click('*[data-id="universalDappUiTitleExpander"]')
      .clickFunction('changeOwner - transact (not payable)', { types: 'address newOwner', values: '0xd9145CCE52D386f254917e481eB44e9943F39138' }) // execute the "changeOwner" function
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'previousOwner0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', 60000) // check that the script is logging the event
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'newOwner0xd9145CCE52D386f254917e481eB44e9943F39138', 60000)
      .end()
  }
}

const asyncAwait = `
  var p = function () {
    return new Promise(function (resolve, reject)  {
        setTimeout(function ()  {
            resolve("Promise Resolved")
        }, 5000)
    })
  } 

  var run = async () => {
    console.log('Waiting Promise')
    var result = await p()
    console.log('result - ', result)
  }

  run()
`

const asyncAwaitWithFileManagerAccess = `
  var p = function () {
    return new Promise(function (resolve, reject)  {
        setTimeout(function ()  {
            resolve("Promise Resolved")
        }, 0)
    })
  }

  var run = async () => {
    console.log('Waiting Promise')
    var result = await p()
    let text = await remix.call('fileManager', 'readFile', 'contracts/3_Ballot.sol')
    console.log('result - ', text)
  }

  run()
`

const resolveExternalUrlAndSave = `
(async () => {
  try {
      console.log('start')
      console.log(await remix.call('contentImport', 'resolveAndSave', 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol'))
  } catch (e) {
      console.log(e.message)
  }
})()  
`

const resolveExternalUrlAndSaveToaPath = `
(async () => {
  try {
      console.log('start')
      console.log(await remix.call('contentImport', 'resolveAndSave', 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol', 'github/newFile.sol'))
  } catch (e) {
      console.log(e.message)
  }
})()  
`

const resolveUrl = `
(async () => {
  try {
      console.log('start')
      console.log(await remix.call('contentImport', 'resolveAndSave', 'contracts/3_Ballot.sol'))
  } catch (e) {
      console.log(e.message)
  }
})()  
`

const deployWithEthersJs = `
// Right click on the script name and hit "Run" to execute
(async () => {
    try {
        console.log('Running deployWithEthers script...')
    
        const constructorArgs = []    // Put constructor args (if any) here for your contract

        // Note that the script needs the ABI which is generated from the compilation artifact.
        // Make sure contract is compiled and artifacts are generated
        const artifactsPath = 'contracts/artifacts/Owner.json' // Change this for different path
    
        const metadata = JSON.parse(await remix.call('fileManager', 'getFile', artifactsPath))
        // 'web3Provider' is a remix global variable object
        const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner()
    
        let factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer);
    
        let contract = await factory.deploy(...constructorArgs);
    
        console.log('Contract Address: ', contract.address);
    
        // The contract is NOT deployed yet; we must wait until it is mined
        await contract.deployed()
        console.log('Deployment successful.')
        
        contract.on('OwnerSet', (previousOwner, newOwner) => {
            console.log('previousOwner' , previousOwner)
            console.log('newOwner' , newOwner)
        })
       
        console.log('ok')
    } catch (e) {
        console.log(e.message)
    }
})()`
