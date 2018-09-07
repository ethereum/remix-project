'use strict'
var csjs = require('csjs-inject')
var globlalRegistry = require('../../global/registry')
var styleGuide = require('../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

class SourceHighlighter {
  constructor (localRegistry) {
    const self = this
    self._components = {}
    self._components.registry = localRegistry || globlalRegistry
    // dependencies
    self._deps = {
      editor: self._components.registry.get('editor').api,
      config: self._components.registry.get('config').api,
      fileManager: self._components.registry.get('filemanager').api,
      compiler: self._components.registry.get('compiler').api
    }
    this.statementMarker = null
    this.fullLineMarker = null
    this.source = null
  }

  currentSourceLocation (lineColumnPos, location) {
    if (this.statementMarker) this._deps.editor.removeMarker(this.statementMarker, this.source)
    if (this.fullLineMarker) this._deps.editor.removeMarker(this.fullLineMarker, this.source)
    if (location && location.file !== undefined) {
      var path = this._deps.compiler.getSourceName(location.file)
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

      var css = csjs`
        .highlightcode {
          position:absolute;
          z-index:20;
          background-color: ${style || styles.editor.backgroundColor_DebuggerMode};
        }
        .highlightcode_fullLine {
          position:absolute;
          z-index:20;
          background-color: ${style || styles.editor.backgroundColor_DebuggerMode};
          opacity: 0.5;
        }
        `

      this.statementMarker = this._deps.editor.addMarker(lineColumnPos, this.source, css.highlightcode)
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
        }, this.source, css.highlightcode_fullLine)
      }
    }
  }
}

module.exports = SourceHighlighter
