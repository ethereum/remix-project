var test = require('tape')
var remixLib = require('remix-lib')

var StatRunner = require('../../dist/src/solidity-analyzer').default
var compilerInput = remixLib.helpers.compiler.compilerInput

const niv = require('npm-install-version')
niv.install('solc@0.5.0')
var compiler = niv.require('solc@0.5.0')

var fs = require('fs')
var path = require('path')
var folder = 'solidity-v0.5'

function compile (fileName) {
  var content = fs.readFileSync(path.join(__dirname, 'test-contracts/' + folder, fileName), 'utf8')
  return JSON.parse(compiler.compile(compilerInput(content)))
}

test('staticAnalysisIssues.functionParameterPassingError', function (t) {
  // https://github.com/ethereum/remix-ide/issues/889#issuecomment-351746474
  t.plan(2)
  var res = compile('functionParameters.sol')

  var Module = require('../../dist/src/solidity-analyzer/modules/checksEffectsInteraction').default

  var statRunner = new StatRunner()

  t.doesNotThrow(() => {
    statRunner.runWithModuleList(res, [{ name: new Module().name, mod: new Module() }], (reports) => {
    })
  }, true, 'Analysis should not throw')

  statRunner.runWithModuleList(res, [{ name: new Module().name, mod: new Module() }], (reports) => {
    t.ok(!reports.some((mod) => mod.report.some((rep) => rep.warning.includes('INTERNAL ERROR')), 'Should not have internal errors'))
  })
})
