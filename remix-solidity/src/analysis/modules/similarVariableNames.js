var name = 'Similar variable names: '
var desc = 'Check if variable names are too similar'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')
var AbstractAst = require('./abstractAstView')
var levenshtein = require('fast-levenshtein')
var remixLib = require('remix-lib')
var util = remixLib.util

function similarVariableNames () {
  this.abstractAst = new AbstractAst()

  this.visit = this.abstractAst.build_visit(
    (node) => false
  )

  this.report = this.abstractAst.build_report(report)
}

similarVariableNames.prototype.visit = function () { throw new Error('similarVariableNames.js no visit function set upon construction') }

similarVariableNames.prototype.report = function () { throw new Error('similarVariableNames.js no report function set upon construction') }

function report (contracts, multipleContractsWithSameName) {
  var warnings = []
  var hasModifiers = contracts.some((item) => item.modifiers.length > 0)

  contracts.forEach((contract) => {
    contract.functions.forEach((func) => {
      var funcName = common.getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
      var hasModifiersComments = ''
      if (hasModifiers) {
        hasModifiersComments = 'Note: Modifiers are currently not considered by this static analysis.'
      }
      var multipleContractsWithSameNameComments = ''
      if (multipleContractsWithSameName) {
        multipleContractsWithSameNameComments = 'Note: Import aliases are currently not supported by this static analysis.'
      }

      var vars = getFunctionVariables(contract, func).map(common.getDeclaredVariableName)

      findSimilarVarNames(vars).map((sim) => {
        warnings.push({
          warning: `${funcName} : Variables have very similar names ${sim.var1} and ${sim.var2}. ${hasModifiersComments} ${multipleContractsWithSameNameComments}`,
          location: func.src
        })
      })
    })
  })

  return warnings
}

function findSimilarVarNames (vars) {
  var similar = []
  var comb = {}
  vars.map((varName1) => vars.map((varName2) => {
    if (varName1.length > 1 && varName2.length > 1 && varName2 !== varName1 && !isCommonPrefixedVersion(varName1, varName2) && !isCommonNrSuffixVersion(varName1, varName2) && !(comb[varName1 + ';' + varName2] || comb[varName2 + ';' + varName1])) {
      comb[varName1 + ';' + varName2] = true
      var distance = levenshtein.get(varName1, varName2)
      if (distance <= 2) similar.push({ var1: varName1, var2: varName2, distance: distance })
    }
  }))
  return similar
}

function isCommonPrefixedVersion (varName1, varName2) {
  return (varName1.startsWith('_') && varName1.slice(1) === varName2) || (varName2.startsWith('_') && varName2.slice(1) === varName1)
}

function isCommonNrSuffixVersion (varName1, varName2) {
  var ref = '^' + util.escapeRegExp(varName1.slice(0, -1)) + '[0-9]*$'

  return varName2.match(ref) != null
}

function getFunctionVariables (contract, func) {
  return contract.stateVariables.concat(func.localVariables)
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  Module: similarVariableNames
}
