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
var TestTab = require('../tabs/test-tab')
var PluginManager = require('../plugin/pluginManager')

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
  self._view.tabbedMenu = new TabbedMenu(appAPI, tabEvents)
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
  // selectTabByClassName
  appAPI.switchTab = tabClass => self._view.tabbedMenu.selectTabByClassName(tabClass)

  events.rhp = self.event

  var compileTab = new CompileTab(appAPI, events, opts)
  optionViews.appendChild(compileTab.render())
  var runTab = new RunTab(appAPI, events, opts)
  optionViews.appendChild(runTab.render())
  var settingsTab = new SettingsTab(appAPI, events, opts)
  optionViews.appendChild(settingsTab.render())
  var analysisTab = new AnalysisTab(appAPI, events, opts)
  optionViews.appendChild(analysisTab.render())
  var debuggerTab = new DebuggerTab(appAPI, events, opts)
  optionViews.appendChild(debuggerTab.render())
  var supportTab = new SupportTab(appAPI, events, opts)
  optionViews.appendChild(supportTab.render())
  var testTab = new TestTab(appAPI, events, opts)
  optionViews.appendChild(testTab.render())
  this._view.tabbedMenu.addTab('Compile', 'compileView', optionViews.querySelector('#compileTabView'))
  this._view.tabbedMenu.addTab('Run', 'runView', optionViews.querySelector('#runTabView'))
  this._view.tabbedMenu.addTab('Settings', 'settingsView', optionViews.querySelector('#settingsView'))
  this._view.tabbedMenu.addTab('Analysis', 'staticanalysisView', optionViews.querySelector('#staticanalysisView'))
  this._view.tabbedMenu.addTab('Debugger', 'debugView', optionViews.querySelector('#debugView'))
  this._view.tabbedMenu.addTab('Support', 'supportView', optionViews.querySelector('#supportView'))
  this._view.tabbedMenu.addTab('Test', 'testView', optionViews.querySelector('#testView'))
  this._view.tabbedMenu.selectTabByTitle('Compile')

  self.pluginManager = new PluginManager(opts.pluginAPI, events)
  events.rhp.register('plugin-loadRequest', (json) => {
    var tab = new PluginTab({}, events, json)
    var content = tab.render()
    optionViews.appendChild(content)
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
