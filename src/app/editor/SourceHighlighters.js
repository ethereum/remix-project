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
    return new Promise((resolve, reject) => {
      let position
      try {
        position = JSON.parse(lineColumnPos)
      } catch (e) {
        throw e
      }
      if (!this.highlighters[mod]) this.highlighters[mod] = new SourceHighlighter()
      this.highlighters[mod].currentSourceLocation(null)
      this.highlighters[mod].currentSourceLocationFromfileName(position, filePath, hexColor)
      resolve()
    })
  }

  async discardHighlight (mod) {
    return new Promise((resolve, reject) => {
      if (this.highlighters[mod]) this.highlighters[mod].currentSourceLocation(null)
      resolve()
    })
  }
}

module.exports = SourceHighlighters
