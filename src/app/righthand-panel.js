var csjs = require('csjs-inject')
var yo = require('yo-yo')
var EventManager = require('ethereum-remix').lib.EventManager

var tabbedMenu = require('./tabbed-menu')
var contractTab = require('./contract-tab')
var settingsTab = require('./settings-tab')
var analysisTab = require('./analysis-tab')
var debuggerTab = require('./debugger-tab')
var filesTab = require('./files-tab')

var css = csjs`
  .options {
      float: left;
      padding: 0.7em 0.3em;
      min-width: 65px;
      font-size: 0.9em;
      cursor: pointer;
      background-color: transparent;
      margin-right: 0.5em;
      font-size: 1em;
  }
  .dragbar             {
    position           : absolute;
    width              : 0.5em;
    top                : 3em;
    bottom             : 0;
    cursor             : col-resize;
    z-index            : 999;
    border-left        : 2px solid hsla(215, 81%, 79%, .3);    
  }
  .ghostbar           {
    width             : 3px;
    background-color  : #C6CFF7;
    opacity           : 0.5;
    position          : absolute;
    cursor            : col-resize;
    z-index           : 9999;
    top               : 0;
    bottom            : 0;
  }
`

// ------------------------------------------------------------------

module.exports = RighthandPanel

function RighthandPanel (appAPI, events, opts) {
  var self = this
  self._api = appAPI
  self.event = new EventManager()
  self._view = {}

  var optionViews = yo`<div id="optionViews" class="settingsView"></div>`
  var options = yo`
    <ul id="options">
      <li class="envView" title="Environment">Contract</li>
      <li class="settingsView" title="Settings">Settings</li>
      <li class="publishView" title="Publish" >Files</li>
      <li class="debugView" title="Debugger">Debugger</li>
      <li class="staticanalysisView" title="Static Analysis">Analysis</li>
      <li id="helpButton"><a href="https://remix.readthedocs.org" target="_blank" title="Open Documentation">Docs</a></li>
    </ul>
  `
  self._view.dragbar = yo`<div id="dragbar" class=${css.dragbar}></div>`
  self._view.element = yo`
    <div id="righthand-panel">
      ${self._view.dragbar}
      <div id="header">
        <div id="menu">
          <img id="solIcon" title="Solidity realtime compiler and runtime" src="assets/img/remix_logo_512x512.svg" alt="Solidity realtime compiler and runtime">
          ${options}
        </div>
        ${optionViews}
      </div>
    </div>
  `
  contractTab(optionViews, appAPI, events, opts)
  settingsTab(optionViews, appAPI, events, opts)
  analysisTab(optionViews, appAPI, events, opts)
  debuggerTab(optionViews, appAPI, events, opts)
  filesTab(optionViews, appAPI, events, opts)

  self.render = function () { return self._view.element }

  self.init = function () {
    ;[...options.children].forEach((el) => { el.classList.add(css.options) })

    // ----------------- tabbed menu -----------------
    var tabbedMenuAPI = {
      warnCompilerLoading: appAPI.warnCompilerLoading
    }
    // load tabbed menu component
    var tabEvents = {compiler: events.compiler, app: events.app}
    tabbedMenu(options, tabbedMenuAPI, tabEvents, {})

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
    function moveGhostbar (event) {
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
