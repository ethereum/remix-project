var name = 'Similar Variable Names'
var desc = 'Check if variable names are to similar'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')
var AbstractAst = require('./abstractAstView')

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
      var comments = (hasModifiers) ? '<br/><i>Note:</i> Modifiers are currently not considered by this static analysis.' : ''
      comments += (multipleContractsWithSameName) ? '<br/><i>Note:</i> Import aliases are currently not supported by this static analysis.' : ''
      var vars = getFunctionVariables(contract, func).map(common.getDeclaredVariableName)

      findSimilarVarNames(vars).map((sim) => {
        warnings.push({
          warning: `<i>${funcName}</i>: Variables have very similar names <i>${sim.var1}</i> and <i>${sim.var2}<i>. ${comments}`,
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
    if (varName1.length > 1 && varName2.length > 1 && varName2 !== varName1 && !(comb[varName1 + ';' + varName2] || comb[varName2 + ';' + varName1])) {
      comb[varName1 + ';' + varName2] = true
      var distance = levenshteinDistance(varName1, varName2)
      if (distance <= 2) similar.push({ var1: varName1, var2: varName2, distance: distance })
    }
  }))
  return similar
}

function getFunctionVariables (contract, func) {
  return contract.stateVariables.concat(func.localVariables)
}

/*
* Props to DerekZiemba (see https://gist.github.com/andrei-m/982927)
* Probably better solutions out there. Libs?
*/
function levenshteinDistance (a, b) {
  let tmp
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  if (a.length > b.length) {
    tmp = a
    a = b
    b = tmp
  }

  let i, j, res
  let alen = a.length
  let blen = b.length
  let row = Array(alen)
  for (i = 0; i <= alen; i++) { row[i] = i }

  for (i = 1; i <= blen; i++) {
    res = i
    for (j = 1; j <= alen; j++) {
      tmp = row[j - 1]
      row[j - 1] = res
      res = b[i - 1] === a[j - 1] ? tmp : Math.min(tmp + 1, Math.min(res + 1, row[j] + 1))
    }
  }
  return res
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  Module: similarVariableNames
}
