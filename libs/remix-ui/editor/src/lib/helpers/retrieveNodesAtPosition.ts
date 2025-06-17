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

export const extractFunctionComments = (code: string, indentSize: number = 0, isSolidity: boolean = false) => {
  // Different patterns for Solidity vs non-Solidity functions
  const functionPattern = isSolidity
    ? /(?:function\s+(\w+)|constructor)\s*(?:\([^)]*\))?\s*(?:public|private|internal|external)?\s*(?:view|pure|payable)?\s*(?:returns\s*\([^)]*\))?\s*(?:is\w+)?\s*{/g
    : /(?:function\s+(\w+)|constructor|(\w+)\s*\([^)]*\)\s*(?::\s*\w+(?:<[^>]+>)?)?\s*{)/g

  const functionPositions = new Map<string, { position: number, commentStart?: number, singleLineComments?: string[] }>()
  let functionMatch

  // First pass: find all function positions
  while ((functionMatch = functionPattern.exec(code)) !== null) {
    const functionName = functionMatch[1] || functionMatch[2] || 'constructor'
    functionPositions.set(functionName, { position: functionMatch.index })
  }

  // Initialize functionComments with null for all functions
  const functionComments = {}
  for (const [functionName] of functionPositions) {
    functionComments[functionName] = null
  }

  const multiLineCommentPattern = /\/\*\*[\s\S]*?\*\//g
  let commentMatch

  while ((commentMatch = multiLineCommentPattern.exec(code)) !== null) {
    const commentStart = commentMatch.index
    const commentEnd = commentStart + commentMatch[0].length
    let nextFunction = null
    let minDistance = Infinity

    for (const [funcName, funcInfo] of functionPositions) {
      if (funcInfo.position > commentEnd && funcInfo.position - commentEnd < minDistance) {
        minDistance = funcInfo.position - commentEnd
        nextFunction = funcName
      }
    }

    if (nextFunction && minDistance < Infinity) {
      const betweenCommentAndFunction = code.slice(commentEnd, functionPositions.get(nextFunction).position)
      const hasOtherFunction = betweenCommentAndFunction.match(functionPattern)

      if (!hasOtherFunction) {
        functionPositions.get(nextFunction).commentStart = commentStart
      }
    }
  }

  for (const [functionName, funcInfo] of functionPositions) {
    const functionStart = funcInfo.position
    const functionStartLine = code.slice(0, functionStart).split('\n').length
    const singleLineComments = []

    let currentLine = functionStartLine - 1
    while (currentLine > 0) {
      const lineStart = code.split('\n').slice(0, currentLine - 1).join('\n').length + (currentLine > 1 ? 1 : 0)
      const lineEnd = code.split('\n').slice(0, currentLine).join('\n').length
      const line = code.slice(lineStart, lineEnd).trim()
      if (line.startsWith('//')) {
        singleLineComments.unshift(line.slice(2).trim())
        currentLine--
      } else if (line === '') {
        currentLine--
      } else {
        break
      }
    }
    if (singleLineComments.length > 0) {
      funcInfo.singleLineComments = singleLineComments
    }
  }

  for (const [functionName, funcInfo] of functionPositions) {
    let processedComment = null

    if (funcInfo.commentStart !== undefined) {
      const comment = code.slice(funcInfo.commentStart, funcInfo.position).trim()

      if (isSolidity) {
        const betweenCommentAndFunction = code.slice(funcInfo.commentStart + comment.length, funcInfo.position)
        const contractKeywordPos = betweenCommentAndFunction.indexOf('contract')

        if (contractKeywordPos === -1) {
          const contractCommentPattern = /\/\*\*[\s\S]*?\*\/\s*contract\s+\w+/g
          processedComment = comment
            .replace(contractCommentPattern, '')
            .trim()
          if (!processedComment.startsWith('/**')) {
            processedComment = '/**' + processedComment
          }
          if (!processedComment.endsWith('*/')) {
            processedComment = processedComment + '*/'
          }

          processedComment = processedComment.split('\n')
            .filter(line => {
              const trimmed = line.trim()
              return trimmed.startsWith('*') || trimmed === '/*' || trimmed === '*/' || trimmed === '/**'
            })
            .join('\n')
            .trim()

          if (indentSize > 0) {
            processedComment = applyIndentation(processedComment, indentSize)
          }

          if (!processedComment.includes('@dev') && !processedComment.includes('@param') && !processedComment.includes('@return')) {
            processedComment = null
          }
        }
      } else {
        processedComment = comment.trim()
        if (!processedComment.startsWith('/**')) {
          processedComment = '/**' + processedComment
        }
        if (!processedComment.endsWith('*/')) {
          processedComment = processedComment + '*/'
        }
        processedComment = processedComment.split('\n')
          .filter(line => {
            const trimmed = line.trim()
            return trimmed.startsWith('*') || trimmed === '/*' || trimmed === '*/' || trimmed === '/**'
          })
          .join('\n')
          .trim()

        if (indentSize > 0) {
          processedComment = applyIndentation(processedComment, indentSize)
        }
      }
    }

    if (!processedComment && funcInfo.singleLineComments && funcInfo.singleLineComments.length > 0) {
      if (isSolidity) {
        processedComment = '/**\n * @dev ' + funcInfo.singleLineComments.join('\n * ') + '\n */'
      } else {
        processedComment = '/**\n * ' + funcInfo.singleLineComments.join('\n * ') + '\n */'
      }
      if (indentSize > 0) {
        processedComment = applyIndentation(processedComment, indentSize)
      }
    }

    functionComments[functionName] = processedComment
  }

  return functionComments
}

// Helper function to apply indentation to comments
const applyIndentation = (comment: string, indentSize: number): string => {
  const indent = '\t'.repeat(indentSize)
  return comment.split('\n').map(line => {
    if (line.trim() === '') return line
    if (line.trim() === '*/' || line.trim() === '/*') {
      return indent + line.trim()
    }
    if (line.trim().startsWith('*')) {
      const content = line.trim().slice(1).trim()
      return indent + '* ' + content
    }
    return indent + line
  }).join('\n')
}
