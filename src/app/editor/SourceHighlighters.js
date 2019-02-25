'use strict'
const SourceHighlighter = require('./sourceHighlighter')

class SourceHighlighters {

  constructor () {
    this.highlighters = {}
  }

  profile () {
    return {
      displayName: 'source highlighters',
      name: 'sourceHighlighters',
      methods: ['highlight', 'discardHighlight'],
      description: 'service - highlight source code'
    }
  }

    // TODO what to do with mod?
  async highlight (mod, lineColumnPos, filePath, hexColor) {
    let position
    try {
      position = JSON.parse(lineColumnPos)
    } catch (e) {
      throw e
    }
    if (!this.highlighters[mod]) this.highlighters[mod] = new SourceHighlighter()
    this.highlighters[mod].currentSourceLocation(null)
    this.highlighters[mod].currentSourceLocationFromfileName(position, filePath, hexColor)
  }

  async discardHighlight (mod) {
    if (this.highlighters[mod]) this.highlighters[mod].currentSourceLocation(null)
  }
}

module.exports = SourceHighlighters
