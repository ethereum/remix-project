const yo = require('yo-yo')
const csjs = require('csjs-inject')
const EventManager = require('../../lib/events')

var globalRegistry = require('../../global/registry')

const styleguide = require('../ui/styles-guide/theme-chooser')
const TabbedMenu = require('../tabs/tabbed-menu')
const PluginTab = require('../tabs/plugin-tab')
const DraggableContent = require('../ui/draggableContent')

const styles = styleguide.chooser()

module.exports = class RighthandPanel {
  constructor ({pluginManager, tabs}, localRegistry) {
    const self = this
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._components.registry.put({api: this, name: 'righthandpanel'})
    self.event = new EventManager()
    self._view = {
      element: null,
      tabbedMenu: null,
      tabbedMenuViewport: null,
      dragbar: null
    }

    var tabbedMenu = new TabbedMenu(self._components.registry)

    self._components = {
      tabbedMenu: tabbedMenu,
      tabs
    }

    self._components.tabs.settings.event.register('plugin-loadRequest', json => {
      self.loadPlugin(json)
    })

    self.loadPlugin = function (json) {
      var modal = new DraggableContent(() => {
        pluginManager.unregister(json)
      })
      var tab = new PluginTab(json)
      var content = tab.render()
      document.querySelector('body').appendChild(modal.render(json.title, json.url, content))
      pluginManager.register(json, modal, content)
    }

    self._view.dragbar = yo`<div id="dragbar" class=${css.dragbar}></div>`
    self._view.element = yo`
      <div id="righthand-panel" class=${css.righthandpanel}>
        ${self._view.dragbar}
        <div id="header" class=${css.header}>
          ${self._components.tabbedMenu.render()}
          ${self._components.tabbedMenu.renderViewport()}
        </div>
      </div>`

    const { compile, run, settings, analysis, debug, support, test } = tabs
    self._components.tabbedMenu.addTab('Compile', 'compileView', compile.render())
    self._components.tabbedMenu.addTab('Run', 'runView', run.render())
    self._components.tabbedMenu.addTab('Analysis', 'staticanalysisView', analysis.render())
    self._components.tabbedMenu.addTab('Testing', 'testView', test.render())
    self._components.tabbedMenu.addTab('Debugger', 'debugView', debug.render())
    self._components.tabbedMenu.addTab('Settings', 'settingsView', settings.render())
    self._components.tabbedMenu.addTab('Support', 'supportView', support.render())
    self._components.tabbedMenu.selectTabByTitle('Compile')
  }

  render () {
    const self = this
    if (self._view.element) return self._view.element
    return self._view.element
  }

  debugger () {
    return this._components.tabs.debug.debugger()
  }

  focusOn (x) {
    if (this._components.tabbedMenu) this._components.tabbedMenu.selectTabByClassName(x)
  }

  init () {
    // @TODO: init is for resizable drag bar only and should be refactored in the future
    const self = this
    const limit = 60
    self._view.dragbar.addEventListener('mousedown', mousedown)
    const ghostbar = yo`<div class=${css.ghostbar}></div>`
    function mousedown (event) {
      event.preventDefault()
      if (event.which === 1) {
        moveGhostbar(event)
        document.body.appendChild(ghostbar)
        document.addEventListener('mousemove', moveGhostbar)
        document.addEventListener('mouseup', removeGhostbar)
        document.addEventListener('keydown', cancelGhostbar)
      }
    }
    function cancelGhostbar (event) {
      if (event.keyCode === 27) {
        document.body.removeChild(ghostbar)
        document.removeEventListener('mousemove', moveGhostbar)
        document.removeEventListener('mouseup', removeGhostbar)
        document.removeEventListener('keydown', cancelGhostbar)
      }
    }
    function getPosition (event) {
      const lhp = window['filepanel'].offsetWidth
      const max = document.body.offsetWidth - limit
      var newpos = (event.pageX > max) ? max : event.pageX
      newpos = (newpos > (lhp + limit)) ? newpos : lhp + limit
      return newpos
    }
    function moveGhostbar (event) { // @NOTE VERTICAL ghostbar
      ghostbar.style.left = getPosition(event) + 'px'
    }
    function removeGhostbar (event) {
      document.body.removeChild(ghostbar)
      document.removeEventListener('mousemove', moveGhostbar)
      document.removeEventListener('mouseup', removeGhostbar)
      document.removeEventListener('keydown', cancelGhostbar)
      self.event.trigger('resize', [document.body.offsetWidth - getPosition(event)])
    }
  }
}

const css = csjs`
  .righthandpanel      {
    display            : flex;
    flex-direction     : column;
    top                : 0;
    right              : 0;
    bottom             : 0;
    box-sizing         : border-box;
    overflow           : hidden;
    height             : 100%;
  }
  .header              {
    height             : 100%;
  }
  .dragbar             {
    position           : absolute;
    width              : 0.5em;
    top                : 3em;
    bottom             : 0;
    cursor             : col-resize;
    z-index            : 999;
    border-left        : 2px solid ${styles.rightPanel.bar_Dragging};
  }
  .ghostbar           {
    width             : 3px;
    background-color  : ${styles.rightPanel.bar_Ghost};
    opacity           : 0.5;
    position          : absolute;
    cursor            : col-resize;
    z-index           : 9999;
    top               : 0;
    bottom            : 0;
  }
`
