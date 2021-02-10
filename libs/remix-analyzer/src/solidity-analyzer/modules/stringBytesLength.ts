import category from './categories'
import algorithm from './algorithmCategories'
import { isStringToBytesConversion, isBytesLengthCheck, getCompilerVersion } from './staticAnalysisCommon'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, MemberAccessAstNode, FunctionCallAstNode, SupportedVersion } from './../../types'

export default class stringBytesLength implements AnalyzerModule {
  name = 'String length: '
  description = 'Bytes length != String length'
  category: ModuleCategory = category.MISC
  algorithm: ModuleAlgorithm = algorithm.EXACT
  version: SupportedVersion = {
    start: '0.4.12'
  }

  stringToBytesConversions: FunctionCallAstNode[] = []
  bytesLengthChecks: MemberAccessAstNode[] = []

  visit (node: FunctionCallAstNode | MemberAccessAstNode): void {
    if (node.nodeType === 'FunctionCall' && isStringToBytesConversion(node)) this.stringToBytesConversions.push(node)
    else if (node.nodeType === 'MemberAccess' && isBytesLengthCheck(node)) this.bytesLengthChecks.push(node)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  report (compilationResults: CompilationResult): ReportObj[] {
    const version = getCompilerVersion(compilationResults.contracts)
    if (this.stringToBytesConversions.length > 0 && this.bytesLengthChecks.length > 0) {
      return [{
        warning: '"bytes" and "string" lengths are not the same since strings are assumed to be UTF-8 encoded (according to the ABI defintion) therefore one character is not nessesarily encoded in one byte of data.',
        location: this.bytesLengthChecks[0].src,
        more: `https://solidity.readthedocs.io/en/${version}/abi-spec.html#argument-encoding`
      }]
    } else {
      return []
    }
  }
}
