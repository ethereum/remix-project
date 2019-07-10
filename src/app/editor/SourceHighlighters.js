'use strict'
const SourceHighlighter = require('./sourceHighlighter')

import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'

const profile = {
  displayName: 'source highlighters',
  name: 'sourceHighlighters',
  description: 'service - highlight source code',
  version: packageJson.version,
  methods: ['highlight', 'discardHighlight']
}

// EditorApi:
// - methods: ['highlight', 'discardHighlight'],

class SourceHighlighters extends Plugin {

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
