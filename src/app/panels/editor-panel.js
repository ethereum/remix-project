var yo = require('yo-yo')
var EventManager = require('../../lib/events')

var Terminal = require('./terminal')
var Editor = require('../editor/editor')
var globalRegistry = require('../../global/registry')
var { TabProxy } = require('./tab-proxy.js')

var ContextualListener = require('../editor/contextualListener')
var ContextView = require('../editor/contextView')
var styles = require('./styles/editor-panel-styles')
var cssTabs = styles.cssTabs
var css = styles.css

class EditorPanel {
  constructor (localRegistry) {
    var self = this
    self.event = new EventManager()
    self._view = {}
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._components.editor = new Editor({})
    self._components.registry.put({api: self._components.editor, name: 'editor'})
  }
  profile () {
    return {
      name: 'code editor',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjk2IDM4NHE0MCAwIDY4IDI4dDI4IDY4djEyMTZxMCA0MC0yOCA2OHQtNjggMjhoLTk2MHEtNDAgMC02OC0yOHQtMjgtNjh2LTI4OGgtNTQ0cS00MCAwLTY4LTI4dC0yOC02OHYtNjcycTAtNDAgMjAtODh0NDgtNzZsNDA4LTQwOHEyOC0yOCA3Ni00OHQ4OC0yMGg0MTZxNDAgMCA2OCAyOHQyOCA2OHYzMjhxNjgtNDAgMTI4LTQwaDQxNnptLTU0NCAyMTNsLTI5OSAyOTloMjk5di0yOTl6bS02NDAtMzg0bC0yOTkgMjk5aDI5OXYtMjk5em0xOTYgNjQ3bDMxNi0zMTZ2LTQxNmgtMzg0djQxNnEwIDQwLTI4IDY4dC02OCAyOGgtNDE2djY0MGg1MTJ2LTI1NnEwLTQwIDIwLTg4dDQ4LTc2em05NTYgODA0di0xMTUyaC0zODR2NDE2cTAgNDAtMjggNjh0LTY4IDI4aC00MTZ2NjQwaDg5NnoiLz48L3N2Zz4=',
      description: ' - ',
      prefferedLocation: 'mainPanel'
    }
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
    self.tabProxy = new TabProxy(self._deps.fileManager, self._components.editor)
    self.data = {
      _FILE_SCROLL_DELTA: 200,
      _layout: {
        top: {
          offset: self._deps.config.get('terminal-top-offset') || 500,
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
      compilers: {}
    },
      {
        getPosition: (event) => {
          var limitUp = 36
          var limitDown = 20
          var height = window.innerHeight
          var newpos = (event.pageY < limitUp) ? limitUp : event.pageY
          newpos = (newpos < height - limitDown) ? newpos : height - limitDown
          return newpos
        }
      })

    self._components.terminal.event.register('filterChanged', (type, value) => {
      this.event.trigger('terminalFilterChanged', [type, value])
    })
    self._components.terminal.event.register('resize', delta => self._adjustLayout('top', delta))
    if (self._deps.txListener) {
      self._components.terminal.event.register('listenOnNetWork', (listenOnNetWork) => {
        self._deps.txListener.setListenOnNetwork(listenOnNetWork)
      })
    }
    if (document && document.head) {
      document.head.appendChild(cssTabs)
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
        else delta = containerHeight
      } else {
        layout.show = true
        self._deps.config.set(`terminal-${direction}-offset`, delta)
        layout.offset = delta
      }
    }
    var tmp = delta - limitDown
    delta = tmp > 0 ? tmp : 0
    if (direction === 'top') {
      var height = containerHeight - delta
      height = height < 0 ? 0 : height
      self._view.editor.style.height = `${delta}px`
      self._view.terminal.style.height = `${height}px` // - menu bar height
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
    self._view.terminal = self._components.terminal.render()
    self._view.content = yo`
      <div class=${css.content}>
        ${self.tabProxy.renderTabsbar()}
        <div class=${css.contextviewcontainer}>
          ${self._components.contextView.render()}
        </div>
        ${self._view.editor}
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
