'use strict'
var SourceHighlighter = require('./sourceHighlighter')

module.exports = class SourceHighlighters {

  constructor () {
    this.highlighters = {}
  }

  profile () {
    return {
      name: 'source highlighters',
      methods: ['highlight', 'discardHighlight'],
      description: 'allows plugins to use highlight feature of the code editor'
    }
  }

    // TODO what to do with mod?
  highlight (mod, lineColumnPos, filePath, hexColor, cb) {
    var position
    try {
      position = JSON.parse(lineColumnPos)
    } catch (e) {
      return cb(e.message)
    }
    if (!highlighters[mod]) highlighters[mod] = new SourceHighlighter()
    highlighters[mod].currentSourceLocation(null)
    highlighters[mod].currentSourceLocationFromfileName(position, filePath, hexColor)
    cb()
  }

  discardHighlight (mod, cb) {
    if (highlighters[mod]) highlighters[mod].currentSourceLocation(null)
    cb()
  }
}
