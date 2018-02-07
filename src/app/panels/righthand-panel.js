var yo = require('yo-yo')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var TabbedMenu = require('../tabs/tabbed-menu')
var compileTab = require('../tabs/compile-tab')
var runTab = require('../tabs/run-tab')
var settingsTab = require('../tabs/settings-tab')
var analysisTab = require('../tabs/analysis-tab')
var debuggerTab = require('../tabs/debugger-tab')
var supportTab = require('../tabs/support-tab')
var pluginTab = require('../tabs/plugin-tab')
var PluginManager = require('../../pluginManager')

var css = require('./styles/righthand-panel-styles')

function RighthandPanel (appAPI, events, opts) {
  var self = this
  self._api = appAPI
  self.event = new EventManager()
  self._view = {}

  var optionViews = yo`<div id="optionViews"></div>`
  var options = yo`
    <ul class=${css.opts}>
    </ul>
  `
  self._view.dragbar = yo`<div id="dragbar" class=${css.dragbar}></div>`
  self._view.element = yo`
    <div id="righthand-panel" class=${css.panel}>
      ${self._view.dragbar}
      <div id="header" class=${css.header}>
        <div class=${css.menu}>
          ${options}
        </div>
        ${optionViews}
      </div>
    </div>
  `
  appAPI.switchTab = (tabClass) => {
    this.event.trigger('switchTab', [tabClass])
  }

  // load tabbed menu component
  var tabEvents = {compiler: events.compiler, app: events.app, rhp: self.event}
  self._view.tabbedMenu = new TabbedMenu(options, tabEvents)

  events.rhp = self.event

  this._view.tabbedMenu.addTab('Compile', 'compileView', compileTab(optionViews, appAPI, events, opts))
  this._view.tabbedMenu.addTab('Run', 'runView', runTab(optionViews, appAPI, events))
  this._view.tabbedMenu.addTab('Settings', 'settingsView', settingsTab(optionViews, appAPI, events))
  this._view.tabbedMenu.addTab('Analysis', 'staticanalysisView', analysisTab(optionViews))
  this._view.tabbedMenu.addTab('Debugger', 'debugView', debuggerTab(optionViews))
  this._view.tabbedMenu.addTab('Support', 'supportView', supportTab(optionViews, events))
  this._view.tabbedMenu.selectTabByTitle('Compile')

  self.pluginManager = new PluginManager(appAPI, events)
  events.rhp.register('plugin-loadRequest', (json) => {
    var content = pluginTab(optionViews, json.url)
    this._view.tabbedMenu.addTab(json.title, 'plugin', content)
    self.pluginManager.register(json, content)
  })

  self.render = function () { return self._view.element }

  self.init = function () {
    ;[...options.children].forEach((el) => { el.classList.add(css.options) })

    // ----------------- resizeable ui ---------------
    var limit = 60
    self._view.dragbar.addEventListener('mousedown', mousedown)
    var ghostbar = yo`<div class=${css.ghostbar}></div>`
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
      var lhp = window['filepanel'].offsetWidth
      var max = document.body.offsetWidth - limit
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

module.exports = RighthandPanel
