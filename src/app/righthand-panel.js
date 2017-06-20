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
      font-size: 0.9em;
      cursor: pointer;
      background-color: transparent;
      margin-right: 0.5em;
      font-size: 1em;
  }
`

// ------------------------------------------------------------------

module.exports = RighthandPanel

function RighthandPanel (container, appAPI, events, opts) {
  var optionViews = yo`<div id="optionViews" class="settingsView"></div>`
  var element = yo`
    <div id="righthand-panel">
      <div id="header">
        <div id="menu">
          <img id="solIcon" title="Solidity realtime compiler and runtime" src="assets/img/remix_logo_512x512.svg" alt="Solidity realtime compiler and runtime">
          <ul id="options">
            <li class="envView" title="Environment">Contract</li>
            <li class="settingsView" title="Settings">Settings</li>
            <li class="publishView" title="Publish" >Files</li>
            <li class="debugView" title="Debugger">Debugger</li>
            <li class="staticanalysisView" title="Static Analysis">Analysis</li>
            <li id="helpButton"><a href="https://remix.readthedocs.org" target="_blank" title="Open Documentation">Docs</a></li>
          </ul>
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
  container.appendChild(element)

  ;[...container.querySelectorAll('#header #options li')].forEach((el) => { el.classList.add(css.options) })

  // ----------------- toggle right hand panel -----------------

  var hidingRHP = false
  $('.toggleRHP').click(function () {
    hidingRHP = !hidingRHP
    setEditorSize(hidingRHP ? 0 : appAPI.config.get(EDITOR_WINDOW_SIZE))
    $('.toggleRHP i').toggleClass('fa-angle-double-right', !hidingRHP)
    $('.toggleRHP i').toggleClass('fa-angle-double-left', hidingRHP)
  })

  // ----------------- tabbed menu -----------------
  var tabbedMenuAPI = {
    warnCompilerLoading: appAPI.warnCompilerLoading
  }
  // load tabbed menu component
  var tabContainer // @TODO
  var tabEvents = {compiler: events.compiler, app: events.app}
  tabbedMenu(tabContainer, tabbedMenuAPI, tabEvents, {})

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

  function setEditorSize (delta) {
    $('#righthand-panel').css('width', delta)
    $('#editor').css('right', delta)
    appAPI.onResize()
  }

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
      setEditorSize(delta)
      appAPI.config.set(EDITOR_WINDOW_SIZE, delta)
      appAPI.reAdjust()
    }
  })

  if (appAPI.config.exists(EDITOR_WINDOW_SIZE)) {
    setEditorSize(appAPI.config.get(EDITOR_WINDOW_SIZE))
  } else {
    appAPI.config.set(EDITOR_WINDOW_SIZE, getEditorSize())
  }
}
