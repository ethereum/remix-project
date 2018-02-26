var yo = require('yo-yo')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var TabbedMenu = require('../tabs/tabbed-menu')
var CompileTab = require('../tabs/compile-tab')
var RunTab = require('../tabs/run-tab')
var SettingsTab = require('../tabs/settings-tab')
var AnalysisTab = require('../tabs/analysis-tab')
var DebuggerTab = require('../tabs/debugger-tab')
var SupportTab = require('../tabs/support-tab')
var PluginTab = require('../tabs/plugin-tab')
var PluginManager = require('../../pluginManager')

var css = require('./styles/righthand-panel-styles')

function RighthandPanel (appAPI = {}, events = {}, opts = {}) {
  var self = this
  self._api = appAPI
  self.event = new EventManager()
  self._view = {}

  var optionViews = yo`<div id="optionViews"></div>`
  self._view.dragbar = yo`<div id="dragbar" class=${css.dragbar}></div>`
  // load tabbed menu component
  var tabEvents = {compiler: events.compiler, app: events.app, rhp: self.event}
  self._view.tabbedMenu = new TabbedMenu(self._api, tabEvents)
  var options = self._view.tabbedMenu.render()
  options.classList.add(css.opts)
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

  events.rhp = self.event

  var compileTab = new CompileTab(appAPI, events)
  optionViews.appendChild(compileTab.render())
  var runTab = new RunTab(appAPI, events)
  optionViews.appendChild(runTab.render())
  var settingsTab = new SettingsTab(appAPI, events)
  optionViews.appendChild(settingsTab.render())
  var analysisTab = new AnalysisTab(appAPI, events)
  optionViews.appendChild(analysisTab.render())
  var debuggerTab = new DebuggerTab(appAPI, events)
  optionViews.appendChild(debuggerTab.render())
  var supportTab = new SupportTab(appAPI, events)
  optionViews.appendChild(supportTab.render())
  this._view.tabbedMenu.addTab('Compile', 'compileView', compileTab.render())
  this._view.tabbedMenu.addTab('Run', 'runView', runTab.render())
  this._view.tabbedMenu.addTab('Settings', 'settingsView', settingsTab.render())
  this._view.tabbedMenu.addTab('Analysis', 'staticanalysisView', analysisTab.render())
  this._view.tabbedMenu.addTab('Debugger', 'debugView', debuggerTab.render())
  this._view.tabbedMenu.addTab('Support', 'supportView', supportTab.render())
  this._view.tabbedMenu.selectTabByTitle('Compile')

  self.pluginManager = new PluginManager(appAPI, events)
  events.rhp.register('plugin-loadRequest', (json) => {
    var content = new PluginTab(appAPI, events, json)
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
