'use strict'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { EditorUI } from '@remix-ui/editor' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'

const EventManager = require('../../lib/events')

const profile = {
  displayName: 'Editor',
  name: 'editor',
  description: 'service - editor',
  version: packageJson.version,
  methods: ['highlight', 'discardHighlight', 'clearAnnotations', 'addAnnotation', 'gotoLine', 'getCursorPosition']
}

class Editor extends Plugin {
  constructor () {
    super(profile)

    this._themes = {
      light: 'light',
      dark: 'vs-dark',
      remixDark: 'remix-dark'
    }

    // Init
    this.event = new EventManager()
    this.sessions = {}
    this.sourceAnnotationsPerFile = {}
    this.markerPerFile = {}
    this.readOnlySessions = {}
    this.previousInput = ''
    this.saveTimeout = null
    this.emptySession = null
    this.modes = {
      sol: 'sol',
      yul: 'sol',
      mvir: 'move',
      js: 'javascript',
      py: 'python',
      vy: 'python',
      zok: 'zokrates',
      lex: 'lexon',
      txt: 'text',
      json: 'json',
      abi: 'json',
      rs: 'rust',
      cairo: 'cairo'
    }

    this.activated = false

    this.events = {
      onBreakPointAdded: (file, line) => this.triggerEvent('breakpointAdded', [file, line]),
      onBreakPointCleared: (file, line) => this.triggerEvent('breakpointCleared', [file, line]),
      onDidChangeContent: (file) => this._onChange(file),
      onEditorMounted: () => this.triggerEvent('editorMounted', [])
    }

    // to be implemented by the react component
    this.api = {}
    this.dispatch = null
  }

  setDispatch (dispatch) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  render () {
    if (this.el) return this.el

    this.el = document.createElement('div')
    this.el.setAttribute('id', 'editorView')
    this.el.currentContent = () => this.currentContent() // used by e2e test
    this.el.setCurrentContent = (value) => {
      if (this.sessions[this.currentFile]) {
        this.sessions[this.currentFile].setValue(value)
        this._onChange(this.currentFile)
      }
    }
    this.el.gotoLine = (line, column) => this.gotoLine(line, column || 0)
    this.el.getCursorPosition = () => this.getCursorPosition()
    return this.el
  }

  renderComponent () {
    ReactDOM.render(
      <EditorUI
        editorAPI={this.api}
        themeType={this.currentThemeType}
        currentFile={this.currentFile}
        sourceAnnotationsPerFile={this.sourceAnnotationsPerFile}
        markerPerFile={this.markerPerFile}
        events={this.events}
        plugin={this}
      />
      , this.el)
  }

  triggerEvent (name, params) {
    this.event.trigger(name, params) // internal stack
    this.emit(name, ...params) // plugin stack
  }

  async onActivation () {
    this.activated = true
    this.on('sidePanel', 'focusChanged', (name) => {
      this.keepDecorationsFor(name, 'sourceAnnotationsPerFile')
      this.keepDecorationsFor(name, 'markerPerFile')
    })
    this.on('sidePanel', 'pluginDisabled', (name) => {
      this.clearAllDecorationsFor(name)
    })

    this.on('theme', 'themeLoaded', (theme) => {
      this.currentThemeType = theme.quality
      this.renderComponent()
    })
    try {
      this.currentThemeType = (await this.call('theme', 'currentTheme')).quality
    } catch (e) {
      console.log('unable to select the theme ' + e.message)
    }
    this.renderComponent()
  }

  onDeactivation () {
    this.off('sidePanel', 'focusChanged')
    this.off('sidePanel', 'pluginDisabled')
  }

  async _onChange (file) {
    const currentFile = await this.call('fileManager', 'file')
    if (!currentFile) {
      return
    }
    if (currentFile !== file) {
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
    this.triggerEvent('contentChanged', [])

    this.saveTimeout = window.setTimeout(() => {
      this.triggerEvent('requiringToSaveCurrentfile', [])
    }, 5000)
  }

  _switchSession (path) {
    if (path === this.currentFile) return
    this.triggerEvent('sessionSwitched', [])
    this.currentFile = path
    this.renderComponent()
  }

  /**
   * Get Ace mode base of the extension of the session file
   * @param {string} path Path of the file
   */
  _getMode (path) {
    if (!path) return this.modes.txt
    const root = path.split('#')[0].split('?')[0]
    let ext = root.indexOf('.') !== -1 ? /[^.]+$/.exec(root) : null
    if (ext) ext = ext[0]
    else ext = 'txt'
    return ext && this.modes[ext] ? this.modes[ext] : this.modes.txt
  }

  /**
   * Create an editor session
   * @param {string} path path of the file
   * @param {string} content Content of the file to open
   * @param {string} mode Mode for this file [Default is `text`]
   */
  _createSession (path, content, mode) {
    if (!this.activated) return
    this.emit('addModel', content, mode, path, false)
    return {
      path,
      language: mode,
      setValue: (content) => {
        this.emit('setValue', path, content)
      },
      getValue: () => {
        return this.api.getValue(path, content)
      },
      dispose: () => {
        this.emit('disposeModel', path)
      }
    }
  }

  /**
   * Attempts to find the string in the current document
   * @param {string} string
   */
  find (string) {
    return this.api.findMatches(this.currentFile, string)
  }

  /**
   * Display an Empty read-only session
   */
  displayEmptyReadOnlySession () {
    if (!this.activated) return
    this.currentFile = null
    this.emit('addModel', '', 'text', '_blank', true)
  }

  /**
   * Set the text in the current session, if any.
   * @param {string} text New text to be place.
   */
  setText (text) {
    if (this.currentFile && this.sessions[this.currentFile]) {
      this.sessions[this.currentFile].setValue(text)
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
    if (!this.sessions[path]) {
      const session = this._createSession(path, content, this._getMode(path))
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
      const session = this._createSession(path, content, this._getMode(path))
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
    if (!path || this.currentFile === path) {
      return this.api.getValue(path)
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
    return this.currentFile
  }

  /**
   * The position of the cursor
   */
  getCursorPosition () {
    return this.api.getCursorPosition()
  }

  /**
   * Remove the current session from the list of sessions.
   */
  discardCurrentSession () {
    if (this.sessions[this.currentFile]) {
      delete this.sessions[this.currentFile]
      this.currentFile = null
    }
  }

  /**
   * Remove a session based on its path.
   * @param {string} path
   */
  discard (path) {
    if (this.sessions[path]) {
      this.sessions[path].dispose()
      delete this.sessions[path]
    }
    if (this.currentFile === path) this.currentFile = null
  }

  /**
   * Increment the font size (in pixels) for the editor text.
   * @param {number} incr The amount of pixels to add to the font.
   */
  editorFontSize (incr) {
    if (!this.activated) return
    const newSize = this.api.getFontSize() + incr
    if (newSize >= 6) {
      this.emit('setFontSize', newSize)
    }
  }

  /**
   * Resize the editor, and sets whether or not line wrapping is enabled.
   * @param {boolean} useWrapMode Enable (or disable) wrap mode
   */
  resize (useWrapMode) {
    if (!this.activated) return
    this.emit('setWordWrap', useWrapMode)
  }

  /**
   * Moves the cursor and focus to the specified line and column number
   * @param {number} line
   * @param {number} col
   */
  gotoLine (line, col) {
    if (!this.activated) return
    this.emit('focus')
    this.emit('revealLine', line + 1, col)
  }

  /**
   * Scrolls to a line. If center is true, it puts the line in middle of screen (or attempts to).
   * @param {number} line The line to scroll to
   */
  scrollToLine (line) {
    if (!this.activated) return
    this.emit('revealLine', line + 1, 0)
  }

  /**
   * Clears all the decorations for the given @arg filePath and @arg plugin, if none is given, the current sesssion is used.
   * An annotation has the following shape:
      column: -1
      row: -1
      text: "browser/Untitled1.sol: Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "SPDX-License-Identifier: <SPDX-License>" to each source file. Use "SPDX-License-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.↵"
      type: "warning"
   * @param {String} filePath
   * @param {String} plugin
   * @param {String} typeOfDecoration
   */
  clearDecorationsByPlugin (filePath, plugin, typeOfDecoration) {
    if (filePath && !this.sessions[filePath]) throw new Error('file not found' + filePath)
    const path = filePath || this.currentFile

    const currentAnnotations = this[typeOfDecoration][path]
    if (!currentAnnotations) return

    const newAnnotations = []
    for (const annotation of currentAnnotations) {
      if (annotation.from !== plugin) newAnnotations.push(annotation)
    }

    this[typeOfDecoration][path] = newAnnotations
    this.renderComponent()
  }

  keepDecorationsFor (name, typeOfDecoration) {
    if (!this.currentFile) return
    if (!this[typeOfDecoration][this.currentFile]) return

    const annotations = this[typeOfDecoration][this.currentFile]
    for (const annotation of annotations) {
      annotation.hide = annotation.from !== name
    }
    this.renderComponent()
  }

  /**
   * Clears all the decorations and for all the sessions for the given @arg plugin
   * An annotation has the following shape:
      column: -1
      row: -1
      text: "browser/Untitled1.sol: Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "SPDX-License-Identifier: <SPDX-License>" to each source file. Use "SPDX-License-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.↵"
      type: "warning"
   * @param {String} filePath
   */
  clearAllDecorationsFor (plugin) {
    for (const session in this.sessions) {
      this.clearDecorationsByPlugin(session, plugin, 'sourceAnnotationsPerFile')
      this.clearDecorationsByPlugin(session, plugin, 'markerPerFile')
    }
  }

  /**
   * Clears all the annotations for the given @arg filePath, the plugin name is retrieved from the context, if none is given, the current sesssion is used.
   * An annotation has the following shape:
      column: -1
      row: -1
      text: "browser/Untitled1.sol: Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "SPDX-License-Identifier: <SPDX-License>" to each source file. Use "SPDX-License-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.↵"
      type: "warning"
   * @param {String} filePath
   * @param {String} plugin
   */
  clearAnnotations (filePath) {
    filePath = filePath || this.currentFile
    const { from } = this.currentRequest
    this.clearDecorationsByPlugin(filePath, from, 'sourceAnnotationsPerFile')
  }

  async addDecoration (decoration, filePath, typeOfDecoration) {
    if (!filePath) return
    filePath = await this.call('fileManager', 'getPathFromUrl', filePath)
    filePath = filePath.file
    if (!this.sessions[filePath]) return
    const path = filePath || this.currentFile

    const { from } = this.currentRequest
    if (!this[typeOfDecoration][path]) this[typeOfDecoration][path] = []
    decoration.from = from
    this[typeOfDecoration][path].push(decoration)
    this.renderComponent()
  }

  /**
   * Add an annotation to the current session.
   * An annotation has the following shape:
      column: -1
      row: -1
      text: "browser/Untitled1.sol: Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "SPDX-License-Identifier: <SPDX-License>" to each source file. Use "SPDX-License-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.↵"
      type: "warning"
   * @param {Object} annotation
   * @param {String} filePath
   */
  async addAnnotation (annotation, filePath) {
    filePath = filePath || this.currentFile
    await this.addDecoration(annotation, filePath, 'sourceAnnotationsPerFile')
  }

  async highlight (position, filePath, highlightColor, opt = { focus: true }) {
    filePath = filePath || this.currentFile
    if (opt.focus) {
      await this.call('fileManager', 'open', filePath)
      this.scrollToLine(position.start.line)
    }
    await this.addDecoration({ position }, filePath, 'markerPerFile')
  }

  discardHighlight () {
    const { from } = this.currentRequest
    for (const session in this.sessions) {
      this.clearDecorationsByPlugin(session, from, 'markerPerFile')
    }
  }
}

module.exports = Editor
