'use strict'
const csjs = require('csjs-inject')
const globlalRegistry = require('../../global/registry')

class SourceHighlighter {
  constructor (localRegistry) {
    this._components = {}
    this._components.registry = localRegistry || globlalRegistry
    // dependencies
    this._deps = {
      editor: this._components.registry.get('editor').api,
      config: this._components.registry.get('config').api,
      fileManager: this._components.registry.get('filemanager').api,
      compilerArtefacts: this._components.registry.get('compilersartefacts').api
    }
    this.statementMarker = null
    this.fullLineMarker = null
    this.source = null
  }

  currentSourceLocation (lineColumnPos, location) {
    if (this.statementMarker) this._deps.editor.removeMarker(this.statementMarker, this.source)
    if (this.fullLineMarker) this._deps.editor.removeMarker(this.fullLineMarker, this.source)
    let lastCompilationResult = this._deps.compilerArtefacts['__last']
    if (location && location.file !== undefined && lastCompilationResult) {
      const path = lastCompilationResult.getSourceName(location.file)
      if (path) {
        this.currentSourceLocationFromfileName(lineColumnPos, path)
      }
    }
  }

  currentSourceLocationFromfileName (lineColumnPos, filePath, style) {
    if (this.statementMarker) this._deps.editor.removeMarker(this.statementMarker, this.source)
    if (this.fullLineMarker) this._deps.editor.removeMarker(this.fullLineMarker, this.source)
    this.statementMarker = null
    this.fullLineMarker = null
    this.source = null
    if (lineColumnPos) {
      this.source = filePath
      if (this._deps.config.get('currentFile') !== this.source) {
        this._deps.fileManager.switchFile(this.source)
      }

      const css = csjs`
        .highlightcode {
          position:absolute;
          z-index:20;
          background-color: ${style || 'var(--info)'};
        }
        .highlightcode_fullLine {
          position:absolute;
          z-index:20;
          opacity: 0.5;
          background-color: ${style || 'var(--info)'};
        }
        .customBackgroundColor {
          background-color: ${style || 'var(--info)'};
        }
        `

      this.statementMarker = this._deps.editor.addMarker(lineColumnPos, this.source, css.highlightcode.className + ' ' + css.customBackgroundColor.className)
      this._deps.editor.scrollToLine(lineColumnPos.start.line, true, true, function () {})

      if (lineColumnPos.start.line === lineColumnPos.end.line) {
        this.fullLineMarker = this._deps.editor.addMarker({
          start: {
            line: lineColumnPos.start.line,
            column: 0
          },
          end: {
            line: lineColumnPos.start.line + 1,
            column: 0
          }
        }, this.source, css.highlightcode_fullLine.className)
      }
    }
  }
}

module.exports = SourceHighlighter
