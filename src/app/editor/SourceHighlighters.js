'use strict'
const SourceHighlighter = require('./sourceHighlighter')

import { ApiFactory } from 'remix-plugin'

class SourceHighlighters extends ApiFactory {

  constructor () {
    super()
    this.highlighters = {}
  }

  get profile () {
    return {
      displayName: 'source highlighters',
      name: 'sourceHighlighters',
      methods: ['highlight', 'discardHighlight'],
      description: 'service - highlight source code'
    }
  }

  highlight (lineColumnPos, filePath, hexColor) {
    const { from } = this.currentRequest
    try {
      const position = JSON.parse(lineColumnPos)
      if (!this.highlighters[from]) this.highlighters[from] = new SourceHighlighter()
      this.highlighters[from].currentSourceLocation(null)
      this.highlighters[from].currentSourceLocationFromfileName(position, filePath, hexColor)
    } catch (e) {
      throw e
    }
  }

  discardHighlight () {
    const { from } = this.currentRequest
    if (this.highlighters[from]) this.highlighters[from].currentSourceLocation(null)
  }
}

module.exports = SourceHighlighters
