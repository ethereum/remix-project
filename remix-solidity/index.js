var CodeAnalysis = require('./src/analysis/staticAnalysisRunner')
var Compiler = require('./src/compiler/compiler')
var CompilerInput = require('./src/compiler/compiler-input')

module.exports = {
  CodeAnalysis: CodeAnalysis,
  Compiler: Compiler,
  CompilerInput: CompilerInput
}
