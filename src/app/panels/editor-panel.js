var yo = require('yo-yo')
var EventManager = require('../../lib/events')

var Terminal = require('./terminal')
var Editor = require('../editor/editor')
var globalRegistry = require('../../global/registry')
var { TabProxy } = require('./tab-proxy.js')

var ContextualListener = require('../editor/contextualListener')
var ContextView = require('../editor/contextView')

var csjs = require('csjs-inject')

var css = csjs`
  .editorpanel         {
    display            : flex;
    flex-direction     : column;
    height             : 100%;
  }
  .content            {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    height            : 100%;
    width             : 100%;
  }
  
`

class EditorPanel {
  constructor (appStore, appManager, mainPanelComponent) {
    var self = this
    self.event = new EventManager()
    self._view = {}
    self._components = {}
    self._components.registry = globalRegistry
    self._components.editor = new Editor({})
    self._components.registry.put({api: self._components.editor, name: 'editor'})
    self.appStore = appStore
    self.appManager = appManager
    self.mainPanelComponent = mainPanelComponent
  }
  init () {
    var self = this
    self._deps = {
      config: self._components.registry.get('config').api,
      txListener: self._components.registry.get('txlistener').api,
      fileManager: self._components.registry.get('filemanager').api,
      udapp: self._components.registry.get('udapp').api,
      pluginManager: self._components.registry.get('pluginmanager').api
    }
    self.tabProxy = new TabProxy(self._deps.fileManager, self._components.editor, self.appStore, self.appManager)
    let showApp = function (name) {
      self.mainPanelComponent.showContent(name)
      self._view.editor.style.display = 'none'
      self._components.contextView.hide()
      self._view.mainPanel.style.display = 'block'
      self.tabProxy.sh
    }
    self.appManager.event.on('ensureActivated', (name) => {
      if (name === 'home') {
        showApp(name)
        self.tabProxy.showTab('home')
      }
    })
    /*
      We listen here on event from the tab component to display / hide the editor and mainpanel
      depending on the content that should be displayed
    */
    self._deps.fileManager.events.on('currentFileChanged', (file) => {
      // we check upstream for "fileChanged"
      self._view.editor.style.display = 'block'
      self._view.mainPanel.style.display = 'none'
      self._components.contextView.show()
    })
    self.tabProxy.event.on('switchFile', (file) => {
      self._view.editor.style.display = 'block'
      self._view.mainPanel.style.display = 'none'
      self._components.contextView.show()
    })
    self.tabProxy.event.on('closeFile', (file) => {
    })
    self.tabProxy.event.on('switchApp', showApp)
    self.tabProxy.event.on('closeApp', (name) => {
      self._view.editor.style.display = 'block'
      self._components.contextView.show()
      self._view.mainPanel.style.display = 'none'
    })
    self.data = {
      _layout: {
        top: {
          offset: self._deps.config.get('terminal-top-offset') || 150,
          show: true
        }
      }
    }

    var contextualListener = new ContextualListener({editor: self._components.editor, pluginManager: self._deps.pluginManager})
    var contextView = new ContextView({contextualListener, editor: self._components.editor})

    self._components.contextualListener = contextualListener
    self._components.contextView = contextView
    self._components.terminal = new Terminal({
      udapp: self._deps.udapp,
      appStore: self.appStore,
      appManager: self.appManager
    },
      {
        getPosition: (event) => {
          var limitUp = 36
          var limitDown = 20
          var height = window.innerHeight
          var newpos = (event.pageY < limitUp) ? limitUp : event.pageY
          newpos = (newpos < height - limitDown) ? newpos : height - limitDown
          return height - newpos
        }
      })

    self._components.terminal.event.register('resize', delta => self._adjustLayout('top', delta))
    if (self._deps.txListener) {
      self._components.terminal.event.register('listenOnNetWork', (listenOnNetWork) => {
        self._deps.txListener.setListenOnNetwork(listenOnNetWork)
      })
    }
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
      self._components.editor.resize((document.querySelector('#editorWrap') || {}).checked)
      self._components.terminal.scroll2bottom()
    }
  }
  getEditor () {
    var self = this
    return self._components.editor
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
    if (self._view.el) return self._view.el
    self._view.editor = self._components.editor.render()
    self._view.editor.style.display = 'none'
    self._view.mainPanel = self.mainPanelComponent.render()
    self._view.terminal = self._components.terminal.render()
    self._view.content = yo`
      <div class=${css.content}>
        ${self.tabProxy.renderTabsbar()}
        ${self._view.editor}
        ${self._view.mainPanel}
        ${self._components.contextView.render()}
        ${self._view.terminal}
      </div>
    `
    self._view.el = yo`
      <div class=${css.editorpanel}>
        ${self._view.content}
      </div>
    `
    // INIT
    self._adjustLayout('top', self.data._layout.top.offset)

    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.keyCode === 84) self.tabProxy.switchNextTab() // alt + t
    })

    return self._view.el
  }
  registerCommand (name, command, opts) {
    var self = this
    return self._components.terminal.registerCommand(name, command, opts)
  }
  updateTerminalFilter (filter) {
    this._components.terminal.updateJournal(filter)
  }
}

module.exports = EditorPanel
