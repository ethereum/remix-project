'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Should create semaphore workspace template #group1 #group2 #group3 #group4': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .click('*[data-id="workspacesMenuDropdown"]')
      .click('*[data-id="workspacecreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=semaphore]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcircuits"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcircuits/semaphore.circom"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/groth16"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/groth16/groth16_trusted_setup.ts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/groth16/groth16_zkproof.ts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/plonk"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/plonk/plonk_trusted_setup.ts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/plonk/plonk_zkproof.ts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtemplates"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtemplates/groth16_verifier.sol.ejs"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtemplates/plonk_verifier.sol.ejs"]')
  },
  'Should compile a simple circuit using editor play button #group1': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="treeViewLitreeViewItemcircuits/simple.circom"]')
      .waitForElementPresent('[data-path="Semaphore - 1/circuits/simple.circom"]')
      .waitForElementVisible('[data-path="Semaphore - 1/circuits/simple.circom"]')
      .waitForElementPresent('[data-id="verticalIconsKindcircuit-compiler"]')
      .waitForElementVisible('[data-id="verticalIconsKindcircuit-compiler"]')
      .click('[data-id="play-editor"]')
      .waitForElementPresent('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wasm"]')
      .waitForElementVisible('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wasm"]')
  },
  'Should compute a witness for a simple circuit #group1': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('circuit-compiler')
      .frame(0)
      .waitForElementVisible('[data-id="witness_toggler"]')
      .click('[data-id="witness_toggler"]')
      .waitForElementVisible('[data-id="compute_witness_btn"]')
      .waitForElementVisible('[data-id="circuit_input_a"]')
      .waitForElementVisible('[data-id="circuit_input_b"]')
      .setValue('[data-id="circuit_input_a"]', '1')
      .setValue('[data-id="circuit_input_b"]', '2')
      .click('[data-id="compute_witness_btn"]')
      .frameParent()
      .clickLaunchIcon('filePanel')
      .waitForElementPresent('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wtn"]')
      .waitForElementVisible('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wtn"]')
  },
  'Should compile a simple circuit using compile button in circom plugin #group2': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="treeViewLitreeViewItemcircuits/simple.circom"]')
      .waitForElementPresent('[data-path="Semaphore - 1/circuits/simple.circom"]')
      .waitForElementVisible('[data-path="Semaphore - 1/circuits/simple.circom"]')
      .clickLaunchIcon('circuit-compiler')
      .frame(0)
      .waitForElementPresent('button[data-id="compile_circuit_btn"]')
      .waitForElementVisible('button[data-id="compile_circuit_btn"]')
      .click('button[data-id="compile_circuit_btn"]')
      .frameParent()
      .clickLaunchIcon('filePanel')
      .waitForElementPresent('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wasm"]')
      .waitForElementVisible('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wasm"]')
  },
  'Should generate R1CS for a simple circuit #group2': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('circuit-compiler')
      .frame(0)
      .waitForElementPresent('button[data-id="generate_r1cs_btn"]')
      .waitForElementVisible('button[data-id="generate_r1cs_btn"]')
      .click('button[data-id="generate_r1cs_btn"]')
      .frameParent()
      .clickLaunchIcon('filePanel')
      .waitForElementPresent('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.r1cs"]')
      .waitForElementVisible('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.r1cs"]')
  },
  'Should compile a simple circuit using CTRL + S from the editor #group3': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="treeViewLitreeViewItemcircuits/simple.circom"]')
      .waitForElementPresent('[data-path="Semaphore - 1/circuits/simple.circom"]')
      .waitForElementVisible('[data-path="Semaphore - 1/circuits/simple.circom"]')
      .waitForElementPresent('[data-id="verticalIconsKindcircuit-compiler"]')
      .waitForElementVisible('[data-id="verticalIconsKindcircuit-compiler"]')
      .perform(function () {
        const actions = this.actions({async: true})

        return actions.keyDown(this.Keys.CONTROL).sendKeys('s')
      })
      .waitForElementPresent('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wasm"]')
      .waitForElementVisible('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wasm"]')
  },
  'Should display warnings for compiled circuit without pragma version #group4': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="treeViewLitreeViewItemcircuits/simple.circom"]')
      .waitForElementPresent('[data-path="Semaphore - 1/circuits/simple.circom"]')
      .waitForElementVisible('[data-path="Semaphore - 1/circuits/simple.circom"]')
      .setEditorValue(warningCircuit)
      .clickLaunchIcon('circuit-compiler')
      .frame(0)
      .waitForElementPresent('button[data-id="compile_circuit_btn"]')
      .waitForElementVisible('button[data-id="compile_circuit_btn"]')
      .click('button[data-id="compile_circuit_btn"]')
      .waitForElementPresent('[data-id="circuit_feedback"]')
      .waitForElementVisible('[data-id="circuit_feedback"]')
      .assert.hasClass('[data-id="circuit_feedback"]', 'alert-warning')
      .waitForElementContainsText('[data-id="circuit_feedback"]', 'File circuits/simple.circom does not include pragma version. Assuming pragma version (2, 1, 8)')
  },
  'Should hide/show warnings for compiled circuit #group4': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="hide_circuit_warnings_checkbox_input"]')
      .waitForElementNotPresent('[data-id="circuit_feedback"]')
      .click('[data-id="hide_circuit_warnings_checkbox_input"]')
      .waitForElementVisible('[data-id="circuit_feedback"]')
      .waitForElementContainsText('[data-id="circuit_feedback"]', 'File circuits/simple.circom does not include pragma version. Assuming pragma version (2, 1, 8)')
  },
  'Should display error for invalid circuit #group4': function (browser: NightwatchBrowser) {
    browser
      .frameParent()
      .setEditorValue(errorCircuit)
      .frame(0)
      .waitForElementPresent('button[data-id="compile_circuit_btn"]')
      .waitForElementVisible('button[data-id="compile_circuit_btn"]')
      .click('button[data-id="compile_circuit_btn"]')
      .waitForElementPresent('[data-id="circuit_feedback"]')
      .assert.hasClass('[data-id="circuit_feedback"]', 'alert-danger')
      .waitForElementContainsText('[data-id="circuit_feedback"]', 'No main specified in the project structure')
  },
  'Should auto compile circuit #group4': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="auto_compile_circuit_checkbox_input"]')
      .frameParent()
      .setEditorValue(validCircuit)
      .frame(0)
      .waitForElementNotPresent('[data-id="circuit_feedback"]')
      .frameParent()
      .clickLaunchIcon('filePanel')
      .waitForElementPresent('[data-id="treeViewLitreeViewItemcircuits/.bin/simple.wasm"]')
  },
  'Should create a new workspace using hash checker template #group5 #group6': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .click('*[data-id="workspacesMenuDropdown"]')
      .click('*[data-id="workspacecreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=hashchecker]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcircuits"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcircuits/calculate_hash.circom"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/groth16"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/groth16/groth16_trusted_setup.ts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/groth16/groth16_zkproof.ts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/plonk"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/plonk/plonk_trusted_setup.ts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemscripts/plonk/plonk_zkproof.ts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtemplates"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtemplates/groth16_verifier.sol.ejs"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtemplates/plonk_verifier.sol.ejs"]')
  },
  'Should run groth16 trusted setup script for hash checker #group5': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="treeViewLitreeViewItemscripts/groth16/groth16_trusted_setup.ts"]')
      .waitForElementPresent('[data-path="Hash Checker - 1/scripts/groth16/groth16_trusted_setup.ts"]')
      .waitForElementVisible('[data-path="Hash Checker - 1/scripts/groth16/groth16_trusted_setup.ts"]')
      .waitForElementPresent('[data-id="verticalIconsKindcircuit-compiler"]')
      .waitForElementVisible('[data-id="verticalIconsKindcircuit-compiler"]')
      .click('[data-id="play-editor"]')
      .pause(2000)
      .journalLastChildIncludes('Generating R1CS for circuits/calculate_hash.circom')
      .pause(5000)
      .journalLastChildIncludes('Everything went okay')
      .journalLastChildIncludes('newZkey')
      .pause(25000)
      .journalLastChildIncludes('setup done.')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemzk/keys/groth16/verification_key.json"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemzk/keys/groth16/zkey_final.txt"]')
  },
  'Should run groth16 zkproof script for hash checker #group5': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="treeViewLitreeViewItemscripts/groth16/groth16_zkproof.ts"]')
      .waitForElementPresent('[data-path="Hash Checker - 1/scripts/groth16/groth16_zkproof.ts"]')
      .waitForElementVisible('[data-path="Hash Checker - 1/scripts/groth16/groth16_zkproof.ts"]')
      .waitForElementPresent('[data-id="verticalIconsKindcircuit-compiler"]')
      .waitForElementVisible('[data-id="verticalIconsKindcircuit-compiler"]')
      .click('[data-id="play-editor"]')
      .pause(2000)
      .journalLastChildIncludes('Compiling circuits/calculate_hash.circom')
      .pause(5000)
      .journalLastChildIncludes('Everything went okay')
      .journalLastChildIncludes('WITNESS CHECKING STARTED')
      .pause(5000)
      .journalLastChildIncludes('WITNESS CHECKING FINISHED SUCCESSFULLY')
      .pause(2000)
      .journalLastChildIncludes('zk proof validity')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemzk/build/groth16/zk_verifier.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemzk/build/groth16/input.json"]')
  },
  'Should run plonk trusted setup script for hash checker #group6': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="treeViewLitreeViewItemscripts/plonk/plonk_trusted_setup.ts"]')
      .waitForElementPresent('[data-path="Hash Checker - 1/scripts/plonk/plonk_trusted_setup.ts"]')
      .waitForElementVisible('[data-path="Hash Checker - 1/scripts/plonk/plonk_trusted_setup.ts"]')
      .waitForElementPresent('[data-id="verticalIconsKindcircuit-compiler"]')
      .waitForElementVisible('[data-id="verticalIconsKindcircuit-compiler"]')
      .click('[data-id="play-editor"]')
      .pause(2000)
      .journalLastChildIncludes('Generating R1CS for circuits/calculate_hash.circom')
      .pause(5000)
      .journalLastChildIncludes('Everything went okay')
      .journalLastChildIncludes('plonk setup')
      .pause(10000)
      .journalLastChildIncludes('setup done')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemzk/keys/plonk/verification_key.json"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemzk/keys/plonk/zkey_final.txt"]')
  },
  'Should run plonk zkproof script for hash checker #group6': function (browser: NightwatchBrowser) {
    browser
      .click('[data-id="treeViewLitreeViewItemscripts/plonk/plonk_zkproof.ts"]')
      .waitForElementPresent('[data-path="Hash Checker - 1/scripts/plonk/plonk_zkproof.ts"]')
      .waitForElementVisible('[data-path="Hash Checker - 1/scripts/plonk/plonk_zkproof.ts"]')
      .waitForElementPresent('[data-id="verticalIconsKindcircuit-compiler"]')
      .waitForElementVisible('[data-id="verticalIconsKindcircuit-compiler"]')
      .click('[data-id="play-editor"]')
      .pause(2000)
      .journalLastChildIncludes('Compiling circuits/calculate_hash.circom')
      .pause(5000)
      .journalLastChildIncludes('Everything went okay')
      .pause(5000)
      .journalLastChildIncludes('zk proof validity')
      .journalLastChildIncludes('proof done.')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemzk/build/plonk/zk_verifier.sol"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemzk/build/plonk/input.json"]')
  }
}

const warningCircuit = `
template Multiplier2() {
  signal input a;
  signal input b;
  signal output c;
  c <== a*b;
}

component main = Multiplier2();
`

const errorCircuit = `
pragma circom 2.0.0;

template Multiplier2() {
    signal input a;
    signal input b;
    signal output c;
    c <== a*b;
 }
`

const validCircuit = `
pragma circom 2.0.0;

template Multiplier2() {
    signal input a;
    signal input b;
    signal output c;
    c <== a*b;
 }

 component main = Multiplier2();
`
