import { PluginType } from "../remix-ui-editor"

export const retrieveNodesAtPosition = async (positionOffset: number, plugin: PluginType) => {
  let nodesAtPosition = await plugin.call('codeParser', 'nodesAtPosition', positionOffset)
  // if no nodes exits at position, try to get the block of which the position is in
  const block = await plugin.call('codeParser', 'getANTLRBlockAtPosition', positionOffset, null)

  if (!nodesAtPosition.length) {
    if (block) {
      nodesAtPosition = await plugin.call('codeParser', 'nodesAtPosition', block.start)
    }
  }
  return { nodesAtPosition, block }
}

export const extractFunctionComments = (code) => {
  // First, remove contract-level comments to avoid matching them
  const contractCommentPattern = /\/\*\*[\s\S]*?\*\/\s*contract\s+\w+/g
  const codeWithoutContractComments = code.replace(contractCommentPattern, 'contract')

  // Regex pattern to match comments followed by function declarations
  const pattern = /(?:\/\*\*[\s\S]*?\*\/|\/\/[^\n]*\n)(?:\s*\/\/[^\n]*\n)*\s*function\s+(\w+)\s*\(/g

  const functionComments = {}
  let match

  while ((match = pattern.exec(codeWithoutContractComments)) !== null) {
    const functionName = match[1]
    const functionPos = code.indexOf(`function ${functionName}`)

    // Get comments full block
    const commentStart = code.lastIndexOf('/*', functionPos) !== -1
      ? code.lastIndexOf('/*', functionPos)
      : code.lastIndexOf('//', functionPos)

    if (commentStart !== -1) {
      const contractKeywordPos = code.indexOf('contract', commentStart)
      if (contractKeywordPos === -1 || contractKeywordPos > functionPos) {
        const commentEnd = code.indexOf('*/', commentStart) !== -1
          ? code.indexOf('*/', commentStart) + 2
          : code.indexOf('\n', commentStart)

        const comment = code.slice(commentStart, commentEnd).trim()
        functionComments[functionName] = comment
      }
    }
  }

  return functionComments
}