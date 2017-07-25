var yo = require('yo-yo')
var $ = require('jquery')

var tabbedMenu = require('./tabbed-menu')
var contractTab = require('./contract-tab')
var settingsTab = require('./settings-tab')
var analysisTab = require('./analysis-tab')
var debuggerTab = require('./debugger-tab')
var filesTab = require('./files-tab')

var csjs = require('csjs-inject')

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
`

// ------------------------------------------------------------------

module.exports = RighthandPanel

function RighthandPanel (appAPI, events, opts) {
  var self = this
  self._api = appAPI
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
  var element = yo`
    <div id="righthand-panel">
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

  self.render = function () { return element }

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

    var EDITOR_WINDOW_SIZE = 'editorWindowSize'

    var dragging = false
    $('#dragbar').mousedown(function (e) {
      e.preventDefault()
      dragging = true
      var main = $('#righthand-panel')
      var ghostbar = $('<div id="ghostbar">', {
        css: {
          top: main.offset().top,
          left: main.offset().left
        }
      }).prependTo('body')

      $(document).mousemove(function (e) {
        ghostbar.css('left', e.pageX + 2)
      })
    })

    var $body = $('body')

    function getEditorSize () {
      return $('#righthand-panel').width()
    }

    $(document).mouseup(function (e) {
      if (dragging) {
        var delta = $body.width() - e.pageX + 2
        $('#ghostbar').remove()
        $(document).unbind('mousemove')
        dragging = false
        delta = (delta < 50) ? 50 : delta
        self._api.setEditorSize(delta)
        appAPI.config.set(EDITOR_WINDOW_SIZE, delta)
      }
    })

    if (appAPI.config.exists(EDITOR_WINDOW_SIZE)) {
      self._api.setEditorSize(appAPI.config.get(EDITOR_WINDOW_SIZE))
    } else {
      appAPI.config.set(EDITOR_WINDOW_SIZE, getEditorSize())
    }
  }
}
