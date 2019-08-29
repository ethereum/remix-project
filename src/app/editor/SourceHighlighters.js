'use strict'
const SourceHighlighter = require('./sourceHighlighter')

import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'

// EditorApi:
// - methods: ['highlight', 'discardHighlight'],

class SourceHighlighters {

  constructor () {
    this.highlighters = {}
  }

  highlight (position, filePath, hexColor, from) {
    try {
      if (!this.highlighters[from]) this.highlighters[from] = new SourceHighlighter()
      this.highlighters[from].currentSourceLocation(null)
      this.highlighters[from].currentSourceLocationFromfileName(position, filePath, hexColor)
    } catch (e) {
      throw e
    }
  }

  discardHighlight (from) {
    if (this.highlighters[from]) this.highlighters[from].currentSourceLocation(null)
  }
}

module.exports = SourceHighlighters
