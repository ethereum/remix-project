'use strict'
const SourceHighlighter = require('./sourceHighlighter')

// EditorApi:
// - methods: ['highlight', 'discardHighlight'],

class SourceHighlighters {

  constructor () {
    this.highlighters = {}
  }

  highlight (position, filePath, hexColor, from) {
    try {
      if (!this.highlighters[from]) this.highlighters[from] = []
      const sourceHighlight = new SourceHighlighter()
      if (
        !this.highlighters[from].length ||
        (this.highlighters[from].length && !this.highlighters[from].find((el) => {
          return el.source === filePath && el.position === position
        }))
      ) {
        sourceHighlight.currentSourceLocationFromfileName(position, filePath, hexColor)
        this.highlighters[from].push(sourceHighlight)
      }
    } catch (e) {
      throw e
    }
  }

  discardHighlight (from) {
    if (this.highlighters[from]) {
      for (const index in this.highlighters[from]) this.highlighters[from][index].currentSourceLocation(null)
    }
    this.highlighters[from] = []
  }

  discardHighlightAt (line, filePath, from) {
    if (this.highlighters[from]) {
      for (const index in this.highlighters[from]) {
        const highlight = this.highlighters[from][index]
        if (highlight.source === filePath &&
            (highlight.position.start.line === line || highlight.position.end.line === line)) {
          highlight.currentSourceLocation(null)
          this.highlighters[from].splice(index, 1)
        }
      }
    }
  }
}

module.exports = SourceHighlighters
