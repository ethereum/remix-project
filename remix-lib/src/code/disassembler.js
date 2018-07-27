'use strict'

var parseCode = require('./codeUtils').parseCode
var util = require('../util')

var createExpressions = function (instructions) {
  var expressions = []
  var labels = 0
  for (var i = 0; i < instructions.length; i++) {
    var expr = instructions[i]
    expr.functional = false
    if (expr.name === 'JUMPDEST') {
      expr.label = 'label' + (++labels)
    } else if (expr.name.slice(0, 3) === 'DUP') {
    } else if (expr.name.slice(0, 4) === 'SWAP') {
    } else if (expr.out <= 1 && expr.in <= expressions.length) {
      var error = false
      for (var j = 0; j < expr.in && !error; j++) {
        var arg = expressions[expressions.length - j - 1]
        if (!arg.functional || arg.out !== 1) {
          error = true
          break
        }
      }
      if (!error) {
        expr.args = expressions.splice(expressions.length - expr.in)
        expr.functional = true
      }
    }
    expressions.push(expr)
  }
  return expressions
}

var toString = function (expr) {
  if (expr.name.slice(0, 4) === 'PUSH') {
    return util.hexConvert(expr.pushData)
  } else if (expr.name === 'JUMPDEST') {
    return expr.label + ':'
  } else if (expr.args) {
    return expr.name.toLowerCase() + '(' + expr.args.reverse().map(toString).join(', ') + ')'
  } else {
    return expr.name.toLowerCase()
  }
}

var disassemble = function (input) {
  var code = parseCode(util.hexToIntArray(input))
  return createExpressions(code).map(toString).join('\n')
}

module.exports = {
 /**
  * Disassembler that turns bytecode (as a hex string) into Solidity inline assembly.
  */
  disassemble: disassemble
}
