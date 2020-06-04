'use strict'
const EventManager = require('../../lib/events')
const yo = require('yo-yo')
const csjs = require('csjs-inject')
const ace = require('brace')
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'

const globalRegistry = require('../../global/registry')
const SourceHighlighters = require('./SourceHighlighters')

const Range = ace.acequire('ace/range').Range
require('brace/ext/language_tools')
require('brace/ext/searchbox')
const langTools = ace.acequire('ace/ext/language_tools')
require('ace-mode-solidity/build/remix-ide/mode-solidity')
require('ace-mode-move/build/remix-ide/mode-move')
require('ace-mode-zokrates')
require('brace/mode/javascript')
require('brace/mode/python')
require('brace/mode/json')
require('brace/mode/rust')
require('brace/theme/chrome')
require('../../../assets/js/editor/darkTheme')

const css = csjs`
  .ace-editor {
    width     : 100%;
  }
`
document.head.appendChild(yo`
  <style>
    .ace-tm .ace_gutter,
    .ace-tm .ace_gutter-active-line,
    .ace-tm .ace_marker-layer .ace_active-line {
        background-color: var(--secondary);
    }
    .ace_gutter-cell.ace_breakpoint{
      background-color: var(--secondary);
    }
  </style>
`)

const profile = {
  displayName: 'Editor',
  name: 'editor',
  description: 'service - editor',
  version: packageJson.version,
  methods: ['highlight', 'discardHighlight', 'discardHighlightAt', 'clearAnnotations', 'addAnnotation']
}

class Editor extends Plugin {

  constructor (opts = {}, themeModule) {
    super(profile)
    // Dependancies
    this._components = {}
    this._components.registry = globalRegistry
    this._deps = {
      config: this._components.registry.get('config').api
    }

    this._themes = {
      'light': 'chrome',
      'dark': 'chaos'
    }
    themeModule.events.on('themeChanged', (theme) => {
      this.setTheme(theme.quality)
    })

    // Init
    this.event = new EventManager()
    this.sessions = {}
    this.sourceAnnotations = []
    this.readOnlySessions = {}
    this.previousInput = ''
    this.saveTimeout = null
    this.sourceHighlighters = new SourceHighlighters()
    this.emptySession = this._createSession('')
    this.modes = {
      sol: 'ace/mode/solidity',
      yul: 'ace/mode/solidity',
      mvir: 'ace/mode/move',
      js: 'ace/mode/javascript',
      py: 'ace/mode/python',
      vy: 'ace/mode/python',
      zok: 'ace/mode/zokrates',
      txt: 'ace/mode/text',
      json: 'ace/mode/json',
      abi: 'ace/mode/json',
      rs: 'ace/mode/rust'
    }

    // Editor Setup
    const el = yo`<div id="input" data-id="editorInput"></div>`
    this.editor = ace.edit(el)

    ace.acequire('ace/ext/language_tools')

    // Unmap ctrl-l & cmd-l
    this.editor.commands.bindKeys({
      'ctrl-L': null,
      'Command-L': null
    })

    // shortcuts for "Ctrl-"" and "Ctrl+"" to increase/decrease font size of the editor
    this.editor.commands.addCommand({
      name: 'increasefontsizeEqual',
      bindKey: {win: 'Ctrl-=', mac: 'Command-='},
      exec: (editor) => {
        this.editorFontSize(1)
      },
      readOnly: true
    })

    this.editor.commands.addCommand({
      name: 'increasefontsizePlus',
      bindKey: {win: 'Ctrl-+', mac: 'Command-+'},
      exec: (editor) => {
        this.editorFontSize(1)
      },
      readOnly: true
    })

    this.editor.commands.addCommand({
      name: 'decreasefontsize',
      bindKey: {win: 'Ctrl--', mac: 'Command--'},
      exec: (editor) => {
        this.editorFontSize(-1)
      },
      readOnly: true
    })

    this.editor.setShowPrintMargin(false)
    this.editor.resize(true)

    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true
    })

    el.className += ' ' + css['ace-editor']
    el.editor = this.editor // required to access the editor during tests
    this.render = () => el

    // Completer for editor
    const flowCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        // @TODO add here other propositions
      }
    }
    langTools.addCompleter(flowCompleter)

    // zoom with Ctrl+wheel
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey && Math.abs(e.wheelY) > 5) {
        this.editorFontSize(e.wheelY > 0 ? 1 : -1)
      }
    })

    // EVENTS LISTENERS

    // Gutter Mouse down
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

    // Do setup on initialisation here
    this.editor.on('changeSession', () => {
      this._onChange()
      this.event.trigger('sessionSwitched', [])

      this.editor.getSession().on('change', () => {
        this._onChange()
        this.event.trigger('contentChanged', [])
      })
    })
  }

  highlight (position, filePath, hexColor) {
    const { from } = this.currentRequest
    this.sourceHighlighters.highlight(position, filePath, hexColor, from)
  }

  discardHighlight () {
    const { from } = this.currentRequest
    this.sourceHighlighters.discardHighlight(from)
  }

  discardHighlightAt (line, filePath) {
    const { from } = this.currentRequest
    this.sourceHighlighters.discardHighlightAt(line, filePath, from)
  }

  setTheme (type) {
    this.editor.setTheme('ace/theme/' + this._themes[type])
  }

  _onChange () {
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
      this.event.trigger('requiringToSaveCurrentfile', [])
    }, 5000)
  }

  _switchSession (path) {
    this.currentSession = path
    this.editor.setSession(this.sessions[this.currentSession])
    this.editor.setReadOnly(this.readOnlySessions[this.currentSession])
    this.editor.focus()
  }

  /**
   * Get Ace mode base of the extension of the session file
   * @param {string} path Path of the file
   */
  _getMode (path) {
    if (!path) return this.modes['txt']
    const root = path.split('#')[0].split('?')[0]
    let ext = root.indexOf('.') !== -1 ? /[^.]+$/.exec(root) : null
    if (ext) ext = ext[0]
    else ext = 'txt'
    return ext && this.modes[ext] ? this.modes[ext] : this.modes['txt']
  }

  /**
   * Create an Ace session
   * @param {string} content Content of the file to open
   * @param {string} mode Ace Mode for this file [Default is `text`]
   */
  _createSession (content, mode) {
    const s = new ace.EditSession(content)
    s.setMode(mode || 'ace/mode/text')
    s.setUndoManager(new ace.UndoManager())
    s.setTabSize(4)
    s.setUseSoftTabs(true)
    return s
  }

  /**
   * Attempts to find the string in the current document
   * @param {string} string
   */
  find (string) {
    return this.editor.find(string)
  }

  /**
   * Display an Empty read-only session
   */
  displayEmptyReadOnlySession () {
    this.currentSession = null
    this.editor.setSession(this.emptySession)
    this.editor.setReadOnly(true)
  }

  /**
   * Sets a breakpoint on the row number
   * @param {number} row Line index of the breakpoint
   * @param {string} className Class of the breakpoint
   */
  setBreakpoint (row, className) {
    this.editor.session.setBreakpoint(row, className)
  }

  /**
   * Increment the font size (in pixels) for the editor text.
   * @param {number} incr The amount of pixels to add to the font.
   */
  editorFontSize (incr) {
    let newSize = this.editor.getFontSize() + incr
    if (newSize >= 6) {
      this.editor.setFontSize(newSize)
    }
  }

  /**
   * Set the text in the current session, if any.
   * @param {string} text New text to be place.
   */
  setText (text) {
    if (this.currentSession && this.sessions[this.currentSession]) {
      this.sessions[this.currentSession].setValue(text)
    }
  }

  /**
   * Upsert and open a session.
   * @param {string} path Path of the session to open.
   * @param {string} content Content of the document or update.
   */
  open (path, content) {
    /*
      we have the following cases:
       - URL prepended with "localhost"
       - URL prepended with "browser"
       - URL not prepended with the file explorer. We assume (as it is in the whole app, that this is a "browser" URL
    */
    if (!path.startsWith('localhost') && !path.startsWith('browser')) path = `browser/${path}`
    if (!this.sessions[path]) {
      const session = this._createSession(content, this._getMode(path))
      this.sessions[path] = session
      this.readOnlySessions[path] = false
    } else if (this.sessions[path].getValue() !== content) {
      this.sessions[path].setValue(content)
    }
    this._switchSession(path)
  }

  /**
   * Upsert and Open a session and set it as Read-only.
   * @param {string} path Path of the session to open.
   * @param {string} content Content of the document or update.
   */
  openReadOnly (path, content) {
    if (!this.sessions[path]) {
      const session = this._createSession(content, this._getMode(path))
      this.sessions[path] = session
      this.readOnlySessions[path] = true
    }
    this._switchSession(path)
  }

  /**
   * Content of the current session
   * @return {String} content of the file referenced by @arg path
   */
  currentContent () {
    return this.get(this.current())
  }

  /**
   * Content of the session targeted by @arg path
   * if @arg path is null, the content of the current session is returned
   * @param {string} path Path of the session to get.
   * @return {String} content of the file referenced by @arg path
   */
  get (path) {
    if (!path || this.currentSession === path) {
      return this.editor.getValue()
    } else if (this.sessions[path]) {
      return this.sessions[path].getValue()
    }
  }

  /**
   * Path of the currently editing file
   * returns `undefined` if no session is being editer
   * @return {String} path of the current session
   */
  current () {
    if (this.editor.getSession() === this.emptySession) {
      return
    }
    return this.currentSession
  }

  /**
   * The position of the cursor
   */
  getCursorPosition () {
    return this.editor.session.doc.positionToIndex(
      this.editor.getCursorPosition(),
      0
    )
  }

  /**
   * Remove the current session from the list of sessions.
   */
  discardCurrentSession () {
    if (this.sessions[this.currentSession]) {
      delete this.sessions[this.currentSession]
      this.currentSession = null
    }
  }

  /**
   * Remove a session based on its path.
   * @param {string} path
   */
  discard (path) {
    if (this.sessions[path]) delete this.sessions[path]
    if (this.currentSession === path) this.currentSession = null
  }

  /**
   * Resize the editor, and sets whether or not line wrapping is enabled.
   * @param {boolean} useWrapMode Enable (or disable) wrap mode
   */
  resize (useWrapMode) {
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

  /**
   * Adds a new marker to the given `Range`.
   * @param {*} lineColumnPos
   * @param {string} source Path of the session to add the mark on.
   * @param {string} cssClass css to apply to the mark.
   */
  addMarker (lineColumnPos, source, cssClass) {
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

  /**
   * Scrolls to a line. If center is true, it puts the line in middle of screen (or attempts to).
   * @param {number} line The line to scroll to
   * @param {boolean} center If true
   * @param {boolean} animate If true animates scrolling
   * @param {Function} callback Function to be called when the animation has finished
   */
  scrollToLine (line, center, animate, callback) {
    this.editor.scrollToLine(line, center, animate, callback)
  }

  /**
   * Remove a marker from the session
   * @param {string} markerId Id of the marker
   * @param {string} source Path of the session
   */
  removeMarker (markerId, source) {
    if (this.sessions[source]) {
      this.sessions[source].removeMarker(markerId)
    }
  }

  /**
   * Clears all the annotations for the current session.
   */
  clearAnnotations () {
    this.sourceAnnotations = []
    this.editor.getSession().clearAnnotations()
  }

  /**
   * Add an annotation to the current session.
   * @param {Object} annotation
   */
  addAnnotation (annotation) {
    this.sourceAnnotations[this.sourceAnnotations.length] = annotation
    this.setAnnotations(this.sourceAnnotations)
  }

  /**
   * Set a list of annotations to the current session.
   * @param {Array<Object>} annotation
   */
  setAnnotations (sourceAnnotations) {
    this.editor.getSession().setAnnotations(sourceAnnotations)
  }

  /**
   * Moves the cursor and focus to the specified line and column number
   * @param {number} line
   * @param {number} col
   */
  gotoLine (line, col) {
    this.editor.focus()
    this.editor.gotoLine(line + 1, col - 1, true)
  }
}

module.exports = Editor
