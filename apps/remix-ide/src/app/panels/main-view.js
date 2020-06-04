var yo = require('yo-yo')
var EventManager = require('../../lib/events')

var globalRegistry = require('../../global/registry')
var { TabProxy } = require('./tab-proxy.js')

var ContextView = require('../editor/contextView')

var csjs = require('csjs-inject')

var css = csjs`
  .mainview            {
    display           : flex;
    flex-direction    : column;
    height            : 100%;
    width             : 100%;
  }
`

export class MainView {
  constructor (contextualListener, editor, mainPanel, fileManager, appManager, terminal) {
    var self = this
    self.event = new EventManager()
    self._view = {}
    self._components = {}
    self._components.registry = globalRegistry
    self.editor = editor
    self.fileManager = fileManager
    self.mainPanel = mainPanel
    self.txListener = globalRegistry.get('txlistener').api
    self._components.terminal = terminal
    self._components.contextualListener = contextualListener
    this.appManager = appManager
    this.init()
  }
  showApp (name) {
    // this.fileManager.unselectCurrentFile()
    this.mainPanel.showContent(name)
    this._view.editor.style.display = 'none'
    this._components.contextView.hide()
    this._view.mainPanel.style.display = 'block'
  }
  getAppPanel () {
    return this.mainPanel
  }
  init () {
    var self = this
    self._deps = {
      config: self._components.registry.get('config').api,
      fileManager: self._components.registry.get('filemanager').api
    }

    self.tabProxy = new TabProxy(self.fileManager, self.editor, self.appManager)
    /*
      We listen here on event from the tab component to display / hide the editor and mainpanel
      depending on the content that should be displayed
    */
    self.fileManager.events.on('currentFileChanged', (file) => {
      // we check upstream for "fileChanged"
      self._view.editor.style.display = 'block'
      self._view.mainPanel.style.display = 'none'
      self._components.contextView.show()
    })
    self.tabProxy.event.on('openFile', (file) => {
      self._view.editor.style.display = 'block'
      self._view.mainPanel.style.display = 'none'
      self._components.contextView.show()
    })
    self.tabProxy.event.on('closeFile', (file) => {
    })
    self.tabProxy.event.on('switchApp', self.showApp.bind(self))
    self.tabProxy.event.on('closeApp', (name) => {
      self._view.editor.style.display = 'block'
      self._components.contextView.show()
      self._view.mainPanel.style.display = 'none'
    })
    self.tabProxy.event.on('tabCountChanged', (count) => {
      if (!count) this.editor.displayEmptyReadOnlySession()
    })
    self.data = {
      _layout: {
        top: {
          offset: self._terminalTopOffset(),
          show: true
        }
      }
    }

    const contextView = new ContextView({contextualListener: self._components.contextualListener, editor: self.editor})

    self._components.contextView = contextView

    self._components.terminal.event.register('resize', delta => self._adjustLayout('top', delta))
    if (self.txListener) {
      self._components.terminal.event.register('listenOnNetWork', (listenOnNetWork) => {
        self.txListener.setListenOnNetwork(listenOnNetWork)
      })
    }
  }
  _terminalTopOffset () {
    return this._deps.config.get('terminal-top-offset') || 150
  }
  _adjustLayout (direction, delta) {
    var limitUp = 0
    var limitDown = 32
    var containerHeight = window.innerHeight - limitUp // - menu bar containerHeight
    var self = this
    var layout = self.data._layout[direction]
    if (layout) {
      if (delta === undefined) {
        layout.show = !layout.show
        if (layout.show) delta = layout.offset
        else delta = 0
      } else {
        layout.show = true
        self._deps.config.set(`terminal-${direction}-offset`, delta)
        layout.offset = delta
      }
    }
    var tmp = delta - limitDown
    delta = tmp > 0 ? tmp : 0
    if (direction === 'top') {
      var mainPanelHeight = containerHeight - delta
      mainPanelHeight = mainPanelHeight < 0 ? 0 : mainPanelHeight
      self._view.editor.style.height = `${mainPanelHeight}px`
      self._view.mainPanel.style.height = `${mainPanelHeight}px`
      self._view.terminal.style.height = `${delta}px` // - menu bar height
      self.editor.resize((document.querySelector('#editorWrap') || {}).checked)
      self._components.terminal.scroll2bottom()
    }
  }
  minimizeTerminal () {
    this._adjustLayout('top')
  }
  showTerminal (offset) {
    this._adjustLayout('top', offset || this._terminalTopOffset())
  }
  getTerminal () {
    return this._components.terminal
  }
  getEditor () {
    var self = this
    return self.editor
  }
  refresh () {
    var self = this
    self._view.tabs.onmouseenter()
  }
  log (data = {}) {
    var self = this
    var command = self._components.terminal.commands[data.type]
    if (typeof command === 'function') command(data.value)
  }
  logMessage (msg) {
    var self = this
    self.log({type: 'log', value: msg})
  }
  logHtmlMessage (msg) {
    var self = this
    self.log({type: 'html', value: msg})
  }
  render () {
    var self = this
    if (self._view.mainview) return self._view.mainview
    self._view.editor = self.editor.render()
    self._view.editor.style.display = 'none'
    self._view.mainPanel = self.mainPanel.render()
    self._view.terminal = self._components.terminal.render()
    self._view.mainview = yo`
      <div class=${css.mainview}>
        ${self.tabProxy.renderTabsbar()}
        ${self._view.editor}
        ${self._view.mainPanel}
        ${self._components.contextView.render()}
        ${self._view.terminal}
      </div>
    `
    // INIT
    self._adjustLayout('top', self.data._layout.top.offset)

    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.keyCode === 84) self.tabProxy.switchNextTab() // alt + t
    })

    return self._view.mainview
  }
  registerCommand (name, command, opts) {
    var self = this
    return self._components.terminal.registerCommand(name, command, opts)
  }
  updateTerminalFilter (filter) {
    this._components.terminal.updateJournal(filter)
  }
}

