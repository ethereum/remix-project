'use strict'
const SourceHighlighter = require('./sourceHighlighter')

class SourceHighlighters {
  constructor () {
    this.highlighters = {}
  }

  highlight (position, filePath, hexColor, from) {
    // eslint-disable-next-line
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

  // highlights all locations for @from plugin
  highlightAllFrom (from) {
    // eslint-disable-next-line
    try {
      if (!this.highlighters[from]) return
      const sourceHighlight = new SourceHighlighter()
      for (const index in this.highlighters[from]) {
        sourceHighlight.currentSourceLocationFromfileName(
          this.highlighters[from][index].position,
          this.highlighters[from][index].source,
          this.highlighters[from][index].style
        )
        this.highlighters[from][index] = sourceHighlight
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

  discardAllHighlights () {
    for (const from in this.highlighters) {
      this.discardHighlight(from)
    }
  }

  hideHighlightsExcept (toStay) {
    for (const highlighter in this.highlighters) {
      for (const index in this.highlighters[highlighter]) {
        this.highlighters[highlighter][index].currentSourceLocation(null)
      }
      this.highlightAllFrom(toStay)
    }
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
