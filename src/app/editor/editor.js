'use strict'
const EventManager = require('../../lib/events')
const yo = require('yo-yo')
const csjs = require('csjs-inject')
const ace = require('brace')

require('brace/theme/tomorrow_night_blue')

const globalRegistry = require('../../global/registry')
const SourceHighlighters = require('./SourceHighlighters')

const Range = ace.acequire('ace/range').Range
require('brace/ext/language_tools')
require('brace/ext/searchbox')
const langTools = ace.acequire('ace/ext/language_tools')
require('ace-mode-solidity/build/remix-ide/mode-solidity')
require('brace/mode/javascript')
require('brace/mode/python')
require('brace/mode/json')
const styleGuide = require('../ui/styles-guide/theme-chooser')
const styles = styleGuide.chooser()

function setTheme(cb) {
  if (styles.appProperties.aceTheme) {
    cb('brace/theme/', styles.appProperties.aceTheme)
  }
}

setTheme((path, theme) => {
  require('brace/theme/tomorrow_night_blue')
})

const css = csjs`
  .ace-editor {
    background-color  : ${styles.editor.backgroundColor_Editor};
    width     : 100%;
  }
`
document.head.appendChild(yo`
  <style>
    .ace-tm .ace_gutter,
    .ace-tm .ace_gutter-active-line,
    .ace-tm .ace_marker-layer .ace_active-line {
        background-color: ${styles.editor.backgroundColor_Tabs_Highlights};
    }
    .ace_gutter-cell.ace_breakpoint{
      background-color: ${styles.editor.backgroundColor_DebuggerMode};
    }
    .highlightreference {
      position:absolute;
      z-index:20;
      background-color: ${
        styles.editor.backgroundColor_Editor_Context_Highlights
      };
      opacity: 0.7
    }

    .highlightreferenceline {
      position:absolute;
      z-index:20;
      background-color: ${
        styles.editor.backgroundColor_Editor_Context_Highlights
      };
      opacity: 0.7
    }

    .highlightcode {
      position:absolute;
      z-index:20;
      background-color: ${
        styles.editor.backgroundColor_Editor_Context_Error_Highlights
      };
     }
  </style>
`)

class Editor {
  /*
  // Private attributs
  _components
  _deps

  // Public attributs
  editor
  event
  sessions
  modes
  sourceAnnotations
  readOnlySessions
  previousInput
  saveTimeout
  sourceHighlighters
  currentSession
  emptySession
  */

  constructor(opts = {}, localRegistry) {
    const el = yo`<div id="input"></div>`
    this.editor = ace.edit(el)
    if (styles.appProperties.aceTheme) {
      this.editor.setTheme('ace/theme/' + styles.appProperties.aceTheme)
    }
    this._components = {}
    this._components.registry = localRegistry || globalRegistry
    this._deps = {
      fileManager: this._components.registry.get('filemanager').api,
      config: this._components.registry.get('config').api
    }

    ace.acequire('ace/ext/language_tools')
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true
    })
    const flowCompleter = {
      getCompletions: function(editor, session, pos, prefix, callback) {
        // @TODO add here other propositions
      }
    }
    langTools.addCompleter(flowCompleter)
    el.className += ' ' + css['ace-editor']
    el.editor = this.editor // required to access the editor during tests
    this.render = () => el

    this.event = new EventManager()
    this.sessions = {}
    this.sourceAnnotations = []
    this.readOnlySessions = {}

    this.emptySession = this._createSession('')
    this.modes = {
      sol: 'ace/mode/solidity',
      js: 'ace/mode/javascript',
      py: 'ace/mode/python',
      vy: 'ace/mode/python',
      txt: 'ace/mode/text',
      json: 'ace/mode/json',
      abi: 'ace/mode/json'
    }

    /** Listen on Gutter Mouse Down */
    this.editor.on('guttermousedown', e => {
      const target = e.domEvent.target
      if (target.className.indexOf('ace_gutter-cell') === -1) {
        return
      }
      const row = e.getDocumentPosition().row
      const breakpoints = e.editor.session.getBreakpoints()
      for (const k in breakpoints) {
        if (k === row.toString()) {
          this.event.trigger('breakpointCleared', [this.currentSession, row])
          e.editor.session.clearBreakpoint(row)
          e.stop()
          return
        }
      }
      this.setBreakpoint(row)
      this.event.trigger('breakpointAdded', [this.currentSession, row])
      e.stop()
    })

    this.previousInput = ''
    this.saveTimeout = null
    // Do setup on initialisation here
    this.editor.on('changeSession', () => {
      this._onChange()
      this.event.trigger('sessionSwitched', [])

      this.editor.getSession().on('change', () => {
        this._onChange()
        this.event.trigger('contentChanged', [])
      })
    })

    // Unmap ctrl-t & ctrl-f
    this.editor.commands.bindKeys({ 'ctrl-t': null })
    this.editor.setShowPrintMargin(false)
    this.editor.resize(true)

    this.sourceHighlighters = new SourceHighlighters()
  }

  _onChange() {
    const currentFile = this._deps.config.get('currentFile')
    if (!currentFile) {
      return
    }
    const input = this.get(currentFile)
    if (!input) {
      return
    }
    // if there's no change, don't do anything
    if (input === this.previousInput) {
      return
    }
    this.previousInput = input

    // fire storage update
    // NOTE: save at most once per 5 seconds
    if (this.saveTimeout) {
      window.clearTimeout(this.saveTimeout)
    }
    this.saveTimeout = window.setTimeout(() => {
      this._deps.fileManager.saveCurrentFile()
    }, 5000)
  }

  _switchSession(path) {
    this.currentSession = path
    this.editor.setSession(this.sessions[this.currentSession])
    this.editor.setReadOnly(this.readOnlySessions[this.currentSession])
    this.editor.focus()
  }

  _getMode(path) {
    let ext = path.indexOf('.') !== -1 ? /[^.]+$/.exec(path) : null
    if (ext) ext = ext[0]
    return ext && this.modes[ext] ? this.modes[ext] : this.modes['txt']
  }

  _createSession(content, mode) {
    const s = new ace.EditSession(content)
    s.setMode(mode || 'ace/mode/text')
    s.setUndoManager(new ace.UndoManager())
    s.setTabSize(4)
    s.setUseSoftTabs(true)
    return s
  }

  find(string) {
    return this.editor.find(string)
  }

  displayEmptyReadOnlySession() {
    this.currentSession = null
    this.editor.setSession(this.emptySession)
    this.editor.setReadOnly(true)
  }

  setBreakpoint(row, css) {
    this.editor.session.setBreakpoint(row, css)
  }

  editorFontSize(incr) {
    this.editor.setFontSize(this.editor.getFontSize() + incr)
  }

  setText(text) {
    if (this.currentSession && this.sessions[this.currentSession]) {
      this.sessions[this.currentSession].setValue(text)
    }
  }

  open(path, content) {
    if (!this.sessions[path]) {
      const session = this._createSession(content, this._getMode(path))
      this.sessions[path] = session
      this.readOnlySessions[path] = false
    } else if (this.sessions[path].getValue() !== content) {
      this.sessions[path].setValue(content)
    }
    this._switchSession(path)
  }

  openReadOnly(path, content) {
    if (!this.sessions[path]) {
      const session = this._createSession(content, this._getMode(path))
      this.sessions[path] = session
      this.readOnlySessions[path] = true
    }
    this._switchSession(path)
  }

  /**
   * returns the content of the current session
   *
   * @return {String} content of the file referenced by @arg path
   */
  currentContent() {
    return this.get(this.current())
  }

  /**
   * returns the content of the session targeted by @arg path
   * if @arg path is null, the content of the current session is returned
   *
   * @return {String} content of the file referenced by @arg path
   */
  get(path) {
    if (!path || this.currentSession === path) {
      return this.editor.getValue()
    } else if (this.sessions[path]) {
      return this.sessions[path].getValue()
    }
  }

  /**
   * returns the path of the currently editing file
   * returns `undefined` if no session is being editer
   *
   * @return {String} path of the current session
   */
  current() {
    if (this.editor.getSession() === this.emptySession) {
      return
    }
    return this.currentSession
  }

  getCursorPosition() {
    return this.editor.session.doc.positionToIndex(
      this.editor.getCursorPosition(),
      0
    )
  }

  discardCurrentSession() {
    if (this.sessions[this.currentSession]) {
      delete this.sessions[this.currentSession]
      this.currentSession = null
    }
  }

  discard(path) {
    if (this.sessions[path]) delete this.sessions[path]
    if (this.currentSession === path) this.currentSession = null
  }

  resize(useWrapMode) {
    this.editor.resize()
    const session = this.editor.getSession()
    session.setUseWrapMode(useWrapMode)
    if (session.getUseWrapMode()) {
      const characterWidth = this.editor.renderer.characterWidth
      const contentWidth = this.editor.container.ownerDocument.getElementsByClassName(
        'ace_scroller'
      )[0].clientWidth

      if (contentWidth > 0) {
        session.setWrapLimit(parseInt(contentWidth / characterWidth, 10))
      }
    }
  }

  addMarker(lineColumnPos, source, cssClass) {
    const currentRange = new Range(
      lineColumnPos.start.line,
      lineColumnPos.start.column,
      lineColumnPos.end.line,
      lineColumnPos.end.column
    )
    if (this.sessions[source]) {
      return this.sessions[source].addMarker(currentRange, cssClass)
    }
    return null
  }

  scrollToLine(line, center, animate, callback) {
    this.editor.scrollToLine(line, center, animate, callback)
  }

  removeMarker(markerId, source) {
    if (this.sessions[source]) {
      this.sessions[source].removeMarker(markerId)
    }
  }

  clearAnnotations() {
    this.sourceAnnotations = []
    this.editor.getSession().clearAnnotations()
  }

  addAnnotation(annotation) {
    this.sourceAnnotations[this.sourceAnnotations.length] = annotation
    this.setAnnotations(this.sourceAnnotations)
  }

  setAnnotations(sourceAnnotations) {
    this.editor.getSession().setAnnotations(sourceAnnotations)
  }

  gotoLine(line, col) {
    this.editor.focus()
    this.editor.gotoLine(line + 1, col - 1, true)
  }
}

module.exports = Editor
