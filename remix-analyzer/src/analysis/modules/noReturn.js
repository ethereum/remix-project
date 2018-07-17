var name = 'no return: '
var desc = 'Function with return type is not returning'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')
var AbstractAst = require('./abstractAstView')

function noReturn () {
  this.abstractAst = new AbstractAst()

  this.visit = this.abstractAst.build_visit(
    (node) => common.isReturn(node) || common.isAssignment(node)
  )

  this.report = this.abstractAst.build_report(report)
}

noReturn.prototype.visit = function () { throw new Error('noReturn.js no visit function set upon construction') }

noReturn.prototype.report = function () { throw new Error('noReturn.js no report function set upon construction') }

function report (contracts, multipleContractsWithSameName) {
  var warnings = []

  contracts.forEach((contract) => {
    contract.functions.filter((func) => common.hasFunctionBody(func.node)).forEach((func) => {
      var funcName = common.getFullQuallyfiedFuncDefinitionIdent(contract.node, func.node, func.parameters)
      if (hasNamedAndUnnamedReturns(func)) {
        warnings.push({
          warning: `${funcName}: Mixing of named and unnamed return parameters is not advised.`,
          location: func.src
        })
      } else if (shouldReturn(func) && !(hasReturnStatement(func) || (hasNamedReturns(func) && hasAssignToAllNamedReturns(func)))) {
        warnings.push({
          warning: `${funcName}: Defines a return type but never explicitly returns a value.`,
          location: func.src
        })
      }
    })
  })

  return warnings
}

function shouldReturn (func) {
  return func.returns.length > 0
}

function hasReturnStatement (func) {
  return func.relevantNodes.filter(common.isReturn).length > 0
}

function hasAssignToAllNamedReturns (func) {
  var namedReturns = func.returns.filter((n) => n.name.length > 0).map((n) => n.name)
  var assignedVars = func.relevantNodes.filter(common.isAssignment).map(common.getEffectedVariableName)
  var diff = namedReturns.filter(e => !assignedVars.includes(e))
  return diff.length === 0
}

function hasNamedReturns (func) {
  return func.returns.filter((n) => n.name.length > 0).length > 0
}

function hasNamedAndUnnamedReturns (func) {
  return func.returns.filter((n) => n.name.length === 0).length > 0 &&
          hasNamedReturns(func)
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  Module: noReturn
}
