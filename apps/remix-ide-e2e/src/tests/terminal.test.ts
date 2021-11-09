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
      .pause(2000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', '2', 60000)
  },

  'Should clear console': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]')
      .journalChildIncludes('Welcome to Remix')
      .click('#clearConsole')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '', 60000)
  },

  'Async/Await Script': function (browser: NightwatchBrowser) {
    browser
      .addFile('asyncAwait.js', { content: asyncAwait })
      .executeScript('remix.execute("asyncAwait.js")')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Waiting Promise', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'result - ', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Promise Resolved', 60000)
  },

  'Call Remix File Manager from a script': function (browser: NightwatchBrowser) {
    browser
      .addFile('asyncAwaitWithFileManagerAccess.js', { content: asyncAwaitWithFileManagerAccess })
      .executeScript('remix.execute(\'asyncAwaitWithFileManagerAccess.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'contract Ballot {', 60000)
  },

  'Call web3.eth.getAccounts() using JavaScript VM': function (browser: NightwatchBrowser) {
    browser
      .executeScript('web3.eth.getAccounts()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4","0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2","0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db","0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB","0x617F2E2fD72FD9D5503197092aC168c91465E7f2","0x17F6AD8Ef982297579C203069C1DbfFE4348c372","0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678","0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7","0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C","0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC","0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c","0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C","0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB","0x583031D1113aD414F02576BD6afaBfb302140225","0xdD870fA1b7C4700F2BD7f44238821C26f7392148"]')
  },

  'Call web3.eth.getAccounts() using Web3 Provider': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear  the terminal
      .clickLaunchIcon('udapp')
      .click('*[data-id="settingsWeb3Mode"]')
      .modalFooterOKClick()
      .executeScript('web3.eth.getAccounts()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '["', 60000) // we check if an array is present, don't need to check for the content
      .waitForElementContainsText('*[data-id="terminalJournal"]', '"]', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', '","', 60000)
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
      // .openFile('deployWithEthersJs.js')
      .pause(1000)
      .click('[data-id="treeViewDivtreeViewItemcontracts"]')
      .openFile('contracts/2_Owner.sol')
      .clickLaunchIcon('solidity')
      .click('*[data-id="compilerContainerCompileBtn"]').pause(5000) // compile Owner
      .executeScript('remix.execute(\'deployWithEthersJs.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Contract Address:', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', '0xd9145CCE52D386f254917e481eB44e9943F39138', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Deployment successful.', 60000)
      .addAtAddressInstance('0xd9145CCE52D386f254917e481eB44e9943F39138', true, true)
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]', 60000)
      .click('*[data-id="universalDappUiTitleExpander"]')
      .clickFunction('changeOwner - transact (not payable)', { types: 'address newOwner', values: '0xd9145CCE52D386f254917e481eB44e9943F39138' }) // execute the "changeOwner" function
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'previousOwner', 60000) // check that the script is logging the event
      .waitForElementContainsText('*[data-id="terminalJournal"]', '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', 60000) // check that the script is logging the event
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'newOwner', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', '0xd9145CCE52D386f254917e481eB44e9943F39138', 60000)
  },

  'Should print hardhat logs': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .addFile('printHardhatlog.sol', { content: hardhatLog })
      .clickLaunchIcon('solidity')
      .waitForElementVisible('[for="autoCompile"]')
      .click('[for="autoCompile"]')
      .testContracts('printHardhatlog.sol', { content: hardhatLog }, ['OwnerTest'])
      .clickLaunchIcon('udapp')
      .click('*[data-id="deployAndRunClearInstances"]')
      .selectContract('OwnerTest')
      .createContract('')
      .pause(1000)
      .journalChildIncludes('constructor', { shouldHaveOnlyOneOccurence: true })
      .pause(5000)
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .clickInstance(0)
      .clickFunction('changeOwner - transact (not payable)', { types: 'address newOwner', values: '0xd9145CCE52D386f254917e481eB44e9943F39138' })
      .pause(1000)
      .journalChildIncludes('inside changeOwner', { shouldHaveOnlyOneOccurence: true })
      .clickFunction('getOwner - call')
      .pause(1000)
      .journalChildIncludes('inside getOwner', { shouldHaveOnlyOneOccurence: true })
  },

  'Should display auto-complete menu': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]')
      .click('*[data-id="terminalCli"]')
      .sendKeys('*[data-id="terminalCliInput"]', 'remix.')
      .assert.visible('*[data-id="autoCompletePopUpAutoCompleteItem"]').end()
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

const hardhatLog = `
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

/**
 * @title Owner
 * @dev Set & change owner
 */
contract OwnerTest {

    address private owner;
    
    // event for EVM logging
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    
    // modifier to check if caller is owner
    modifier isOwner() {
        // If the first argument of 'require' evaluates to 'false', execution terminates and all
        // changes to the state and to Ether balances are reverted.
        // This used to consume all gas in old EVM versions, but not anymore.
        // It is often a good idea to use 'require' to check if functions are called correctly.
        // As a second argument, you can also provide an explanation about what went wrong.
        require(msg.sender == owner, "Caller is not owner");
        _;
    }
    
    /**
     * @dev Set contract deployer as owner
     */
    constructor() {
        console.log("constructor");
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit OwnerSet(address(0), owner);
    }

    /**
     * @dev Change owner
     * @param newOwner address of new owner
     */
    function changeOwner(address newOwner) public isOwner {
        console.log("inside changeOwner");
        emit OwnerSet(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Return owner address 
     * @return address of owner
     */
    function getOwner() external view returns (address) {
        console.log("inside getOwner");
        return owner;
    }
}`
