'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'
import examples from '../examples/example-contracts'

const sources = [
  {'browser/Untitled.sol': {content: examples.ballot.content}},
  {'browser/Untitled1.sol': {content: `contract test {}`}}
]

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'The sequence: Compiling / Deploying / Compiling another contract / calling the first contract - should display in the log the transaction with all the decoded information': function (browser: NightwatchBrowser) {
    // https://github.com/ethereum/remix-ide/issues/2864
    browser
    .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
    .clickLaunchIcon('solidity')
    .testContracts('Untitled.sol', sources[0]['browser/Untitled.sol'], ['Ballot'])
    .clickLaunchIcon('udapp')
    .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c')
    .setValue('input[placeholder="bytes32[] proposalNames"]', '["0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"]')
    .click('*[data-id="Deploy - transact (not payable)"]')
    .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]')
    .click('*[data-id="universalDappUiTitleExpander"]')
    .pause(5000)
    .clickFunction('delegate - transact (not payable)', {types: 'address to', values: '0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db'})
    .pause(5000)
    .testFunction('0xaccc0cfdad143b4468d8ac6ea4f49d68aed4bbd80edefa5f0aca7e3d433db028',
      {
        status: 'Status not available at the moment',
        'transaction hash': '0xaccc0cfdad143b4468d8ac6ea4f49d68aed4bbd80edefa5f0aca7e3d433db028'//,
        // 'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
      })
    .pause(5000)
    .clickLaunchIcon('solidity')
    .testContracts('Untitled1.sol', sources[1]['browser/Untitled1.sol'], ['test'])
    .pause(5000)
    .clickLaunchIcon('udapp')
    .clickFunction('delegate - transact (not payable)', {types: 'address to', values: ''})
    .pause(35000)
    .testFunction('0xaccc0cfdad143b4468d8ac6ea4f49d68aed4bbd80edefa5f0aca7e3d433db028',
      {
        status: 'Status not available at the moment',
        'transaction hash': '0xaccc0cfdad143b4468d8ac6ea4f49d68aed4bbd80edefa5f0aca7e3d433db028'//,
        // 'decoded input': { 'address to': '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB' }
      })
    .end()
  },

  tearDown: sauce
}
