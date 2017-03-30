// var test = require('tape')

// var common = require('../../babelify-src/app/staticanalysis/modules/staticAnalysisCommon')
// var StatRunner = require('../../babelify-src/app/staticanalysis/staticAnalysisRunner')
// var utils = require('../../babelify-src/app/utils')
// var Compiler = require('../../babelify-src/app/compiler')

// var fs = require('fs')
// var path = require('path')

// var testFiles = [
//   '/test-contracts/KingOfTheEtherThrone.sol',
//   '/test-contracts/assembly.sol',
//   '/test-contracts/ballot.sol',
//   '/test-contracts/ballot_reentrant.sol',
//   '/test-contracts/ballot_withoutWarning.sol',
//   '/test-contracts/cross_contract.sol',
//   '/test-contracts/inheritance.sol',
//   '/test-contracts/notReentrant.sol',
//   '/test-contracts/structReentrant.sol',
//   '/test-contracts/thisLocal.sol',
//   '/test-contracts/modifier1.sol',
//   '/test-contracts/modifier2.sol'
// ]

// test('thisLocal.js', function (t) {
//   t.plan(0)

//   var module = require('../../babelify-src/app/staticanalysis/modules/thisLocal')

//   runModuleOnFiles(module, t)
// })

// function runModuleOnFiles (module, t) {
//   var fakeImport = function (url, cb) { cb('Not implemented') }
//   var compiler = new Compiler(fakeImport)
//   var statRunner = new StatRunner()

//   testFiles.map((fileName) => {
//     var contents = fs.readFileSync(path.join(__dirname, fileName), 'utf8')
//     var compres = compiler.compile({ 'test': contents }, 'test')

//     statRunner.runWithModuleList(compres, [{ name: module.name, mod: new module.Module() }], (reports) => {
//       reports.map((r) => t.comment(r.warning))
//     })
//   })
// }
