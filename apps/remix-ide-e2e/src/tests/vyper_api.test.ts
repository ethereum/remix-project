'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testplugin: { name: string, url: string }; }
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://localhost:8080')
  },

  'Should connect to vyper plugin #group1': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('pluginManager')
      .scrollAndClick('[data-id="pluginManagerComponentActivateButtonvyper"]')
      .clickLaunchIcon('vyper')
      .pause(5000)
      // @ts-ignore
      .frame(0)
  },

  'Should clone the Vyper repo #group1': function (browser: NightwatchBrowser) {
    browser.click('button[data-id="add-repository"]')
      .frameParent()
      .clickLaunchIcon('filePanel')
      .waitForElementVisible({
        selector: "//*[@data-id='workspacesSelect' and contains(.,'vyper-lang')]",
        locateStrategy: 'xpath',
        timeout: 60000
      })
      .currentWorkspaceIs('vyper-lang')
      .waitForElementVisible({
        selector: "//*[@data-id='treeViewLitreeViewItemexamples' and contains(.,'examples')]",
        locateStrategy: 'xpath',
        timeout: 60000
      })
      .openFile('examples')
      .openFile('examples/auctions')
      .openFile('examples/auctions/blind_auction.vy')
  },

  'Compile blind_auction should success #group1': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('vyper')
      // @ts-ignore
      .frame(0)
      .click('[data-id="remote-compiler"]')
      .click('[data-id="compile"]')
      .isVisible({
        selector: '[data-id="copy-abi"]',
        timeout: 4000,
        abortOnFailure: false,
        suppressNotFoundErrors: true
      }, (okVisible) => {
        if (okVisible.value === null) {
          console.log('retrying compilation...')
          browser.click('[data-id="compile"]').waitForElementVisible('[data-id="copy-abi"]')
        } else{
          browser.assert.ok(okVisible.value === true, 'ABI should be visible')
        }
      })


  },

  'Compile test contract and deploy to remix VM #group1': function (browser: NightwatchBrowser) {
    let contractAddress
    browser
      .frameParent()
      .clickLaunchIcon('filePanel')
      .switchWorkspace('default_workspace')
      .addFile('test.vy', { content: testContract })
      .clickLaunchIcon('vyper')
      // @ts-ignore
      .frame(0)
      .click('[data-id="compile"]')
      .isVisible({
        selector: '[data-id="copy-abi"]',
        timeout: 4000,
        abortOnFailure: false,
        suppressNotFoundErrors: true
      }, (okVisible) => {
        if (okVisible.value === null) {
          console.log('retrying compilation...')
          browser.click('[data-id="compile"]').waitForElementVisible('[data-id="copy-abi"]')
        } else{
          browser.assert.ok(okVisible.value === true, 'ABI should be visible')
        }
      })
      .frameParent()
      .clickLaunchIcon('udapp')
      .createContract('')
      .clickInstance(0)
      .clickFunction('totalPokemonCount - call')
      .getAddressAtPosition(0, (address) => {
        console.log('Vyper contract ' + address)
        contractAddress = address
      })
      .perform((done) => {
        browser.verifyCallReturnValue(contractAddress, ['0:uint256: 0'])
          .perform(() => done())
      })
  }
}

const testContract = `
# @version >=0.2.4 <0.3.0

DNA_DIGITS: constant(uint256) = 16
DNA_MODULUS: constant(uint256) = 10 ** DNA_DIGITS
# add HP_LIMIT

struct Pokemon:
    name: String[32]
    dna: uint256
    HP: uint256
    matches: uint256
    wins: uint256

totalPokemonCount: public(uint256)
pokemonList: HashMap[uint256, Pokemon]

@pure
@internal
def _generateRandomDNA(_name: String[32]) -> uint256:
    random: uint256 = convert(keccak256(_name), uint256)
    return random % DNA_MODULUS
# modify _createPokemon
@internal
def _createPokemon(_name: String[32], _dna: uint256, _HP: uint256):
    self.pokemonList[self.totalPokemonCount] = Pokemon({
        name: _name,
        dna: _dna,
        HP: _HP,
        matches: 0,
        wins: 0
    })
    self.totalPokemonCount += 1`
