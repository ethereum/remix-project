'use strict'
const SourceHighlighter = require('./sourceHighlighter')

class SourceHighlighters {

  constructor () {
    this.highlighters = {}
  }

  profile () {
    return {
      name: 'source highlighters',
      methods: ['highlight', 'discardHighlight'],
      description: 'service - highlight source code'
    }
  }

    // TODO what to do with mod?
  highlight (mod, lineColumnPos, filePath, hexColor, cb) {
    let position
    try {
      position = JSON.parse(lineColumnPos)
    } catch (e) {
      return cb(e.message)
    }
    if (!this.highlighters[mod]) this.highlighters[mod] = new SourceHighlighter()
    this.highlighters[mod].currentSourceLocation(null)
    this.highlighters[mod].currentSourceLocationFromfileName(position, filePath, hexColor)
    cb()
  }

  discardHighlight (mod, cb) {
    if (this.highlighters[mod]) this.highlighters[mod].currentSourceLocation(null)
    cb()
  }
}

module.exports = SourceHighlighters