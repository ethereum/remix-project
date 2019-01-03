const yo = require('yo-yo')
const csjs = require('csjs-inject')
const remixLib = require('remix-lib')

var globalRegistry = require('../../global/registry')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()
// const PluginManager = require('../plugin/pluginManager')
// const TabbedMenu = require('../tabs/tabbed-menu')
// const CompileTab = require('../tabs/compile-tab')
// const SettingsTab = require('../tabs/settings-tab')
// const AnalysisTab = require('../tabs/analysis-tab')
// const DebuggerTab = require('../tabs/debugger-tab')
// const SupportTab = require('../tabs/support-tab')
// const PluginTab = require('../tabs/plugin-tab')
// const TestTab = require('../tabs/test-tab')
// const RunTab = require('../tabs/run-tab')
// const DraggableContent = require('../ui/draggableContent')

const EventManager = remixLib.EventManager

// var async = require('async')

// var tooltip = require('../ui/tooltip')

// var styleGuide = require('../ui/styles-guide/theme-chooser')

// var css = require('./styles/file-panel-styles')

// var canUpload = window.File || window.FileReader || window.FileList || window.Blob
// var ghostbar = yo`<div class=${css.ghostbar}></div>`

/*
  Overview of APIs:
   * fileManager: @args fileProviders (browser, shared-folder, swarm, github, etc ...) & config & editor
      - listen on browser & localhost file provider (`fileRenamed` & `fileRemoved`)
      - update the tabs, switchFile
      - trigger `currentFileChanged`
      - set the current file in the config
   * fileProvider: currently browser, swarm, localhost, github, gist
      - link to backend
      - provide properties `type`, `readonly`
      - provide API `resolveDirectory`, `remove`, `exists`, `rename`, `get`, `set`
      - trigger `fileExternallyChanged`, `fileRemoved`, `fileRenamed`, `fileRenamedError`, `fileAdded`
   * file-explorer: treeview @args fileProvider
      - listen on events triggered by fileProvider
      - call fileProvider API
*/

module.exports = class LeftIconPanel {
  constructor (localRegistry) {
    const self = this
    self._components = {}
    self._components.registry = localRegistry || globalRegistry

    self._components.registry.put({api: this, name: 'lefticonpanel'})
    self.event = new EventManager()
    self._view = {
      element: null,
      tabbedMenu: null,
      tabbedMenuViewport: null,
      dragbar: null
    }

    self.plugins = [
      {type: 'fileManager', displayName: 'File Manger', icon: 'fa fa-files-o fa-2x'},
      {type: 'pluginManager', displayName: 'Plugin Manger', icon: 'fa fa-puzzle-piece fa-2x'},
      {type: 'settings', displayName: 'setting', icon: 'fa fa-cog fa-2x'}
    ]
  }
  

  swapPlugin (name) {
    console.log(name)
  }

  render () {
    const self = this
    // if (self._view.element) return self._view.element
    // return self._view.element
    return yo`
    <div class=${css.container}>
      <ul>
      ${self.plugins.map(function (pi) {
        return yo`<li>
          <i onclick=${() => { self.swapPlugin(pi.type) }} style="size: 24px;" class="${pi.icon} ${css.plugin}"></i>
        </li>`
      })
      }
      </ul>
    </div>
    `
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
  .lefticonpanel      {
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
  i.plugin            {
    cursor            : pointer;
  }
  .container ul {
    margin-top        : 10px;
  }
  .container ul li {
    text-align        : center;
    margin-top        : 10px;
  }
`
