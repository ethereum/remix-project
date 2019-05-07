'use strict'
const SourceHighlighter = require('./sourceHighlighter')

import { EditorApi } from 'remix-plugin'

const profile = {
  displayName: 'source highlighters',
  name: 'editor',
  description: 'service - highlight source code'
}

// EditorApi:
// - methods: ['highlight', 'discardHighlight'],

class SourceHighlighters extends EditorApi {

  constructor () {
    super(profile)
    this.highlighters = {}
  }

  highlight (position, filePath, hexColor) {
    const { from } = this.currentRequest
    try {
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
