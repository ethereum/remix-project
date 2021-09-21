import { Plugin } from '@remixproject/engine'
const yo = require('yo-yo')
const $ = require('jquery')
const EventEmitter = require('events')
const globalRegistry = require('../../global/registry')
const csjs = require('csjs-inject')
const helper = require('../../lib/helper')
require('remix-tabs')

const css = csjs`
  .remix_tabs div[title]{
    display: flex;
  }
`

const profile = {
  name: 'tabs',
  methods: ['focus'],
  kind: 'other'
}

// @todo(#650) Merge this with MainPanel into one plugin
export class TabProxy extends Plugin {
  constructor (fileManager, editor, appManager) {
    super(profile)
    this.event = new EventEmitter()
    this.fileManager = fileManager
    this.appManager = appManager
    this.editor = editor
    this.data = {}
    this._view = {}
    this._handlers = {}
    this.loadedTabs = []

    globalRegistry.get('themeModule').api.events.on('themeChanged', (theme) => {
    // update invert for all icons
      this.updateImgStyles()
    })

    fileManager.events.on('filesAllClosed', () => {
      this.call('manager', 'activatePlugin', 'home')
      this._view.filetabs.active = 'home'
    })

    fileManager.events.on('fileRemoved', (name) => {
      const workspace = this.fileManager.currentWorkspace()
      workspace ? this.removeTab(workspace + '/' + name) : this.removeTab(this.fileManager.mode + '/' + name)
    })

    fileManager.events.on('fileClosed', (name) => {
      const workspace = this.fileManager.currentWorkspace()

      workspace ? this.removeTab(workspace + '/' + name) : this.removeTab(this.fileManager.mode + '/' + name)
    })

    fileManager.events.on('currentFileChanged', (file) => {
      const workspace = this.fileManager.currentWorkspace()

      if (workspace) {
        const workspacePath = workspace + '/' + file

        if (this._handlers[workspacePath]) {
          this._view.filetabs.activateTab(workspacePath)
          return
        }
        this.addTab(workspacePath, '', () => {
          this.fileManager.open(file)
          this.event.emit('openFile', file)
        },
        () => {
          this.fileManager.closeFile(file)
          this.event.emit('closeFile', file)
        })
      } else {
        const path = this.fileManager.mode + '/' + file

        if (this._handlers[path]) {
          this._view.filetabs.activateTab(path)
          return
        }
        this.addTab(path, '', () => {
          this.fileManager.open(file)
          this.event.emit('openFile', file)
        },
        () => {
          this.fileManager.closeFile(file)
          this.event.emit('closeFile', file)
        })
      }
    })

    fileManager.events.on('fileRenamed', (oldName, newName, isFolder) => {
      const workspace = this.fileManager.currentWorkspace()

      if (workspace) {
        if (isFolder) {
          for (const tab of this.loadedTabs) {
            if (tab.name.indexOf(workspace + '/' + oldName + '/') === 0) {
              const newTabName = workspace + '/' + newName + tab.name.slice(workspace + '/' + oldName.length, tab.name.length)
              this.renameTab(tab.name, newTabName)
            }
          }
          return
        }
        // should change the tab title too
        this.renameTab(workspace + '/' + oldName, workspace + '/' + newName)
      } else {
        if (isFolder) {
          for (const tab of this.loadedTabs) {
            if (tab.name.indexOf(this.fileManager.mode + '/' + oldName + '/') === 0) {
              const newTabName = this.fileManager.mode + '/' + newName + tab.name.slice(this.fileManager.mode + '/' + oldName.length, tab.name.length)
              this.renameTab(tab.name, newTabName)
            }
          }
          return
        }
        // should change the tab title too
        this.renameTab(this.fileManager.mode + '/' + oldName, workspace + '/' + newName)
      }
    })

    appManager.event.on('activate', ({ name, location, displayName, icon }) => {
      if (location === 'mainPanel') {
        this.addTab(
          name,
          displayName,
          () => this.event.emit('switchApp', name),
          () => {
            this.event.emit('closeApp', name)
            this.call('manager', 'deactivatePlugin', name)
          },
          icon
        )
        this.switchTab(name)
      }
    })

    appManager.event.on('deactivate', (profile) => {
      this.removeTab(profile.name)
    })
  }

  focus (name) {
    this.event.emit('switchApp', name)
    this._view.filetabs.activateTab(name)
  }

  updateImgStyles () {
    const images = this._view.filetabs.getElementsByClassName('iconImage')
    for (const element of images) {
      globalRegistry.get('themeModule').api.fixInvert(element)
    };
  }

  switchTab (tabName) {
    if (this._handlers[tabName]) {
      this._handlers[tabName].switchTo()
      this._view.filetabs.activateTab(tabName)
    }
  }

  switchNextTab () {
    const active = this._view.filetabs.active
    if (active && this._handlers[active]) {
      const handlers = Object.keys(this._handlers)
      let i = handlers.indexOf(active)
      if (i >= 0) {
        i = handlers[i + 1] ? i + 1 : 0
        this.switchTab(handlers[i])
      }
    }
  }

  switchPreviousTab () {
    const active = this._view.filetabs.active
    if (active && this._handlers[active]) {
      const handlers = Object.keys(this._handlers)
      let i = handlers.indexOf(active)
      if (i >= 0) {
        i = handlers[i - 1] ? i - 1 : handlers.length - 1
        this.switchTab(handlers[i])
      }
    }
  }

  switchToActiveTab () {
    const active = this._view.filetabs.active
    if (active && this._handlers[active]) {
      this.switchTab(active)
    }
  }

  renameTab (oldName, newName) {
    this.addTab(newName, '', () => {
      this.fileManager.open(newName)
      this.event.emit('openFile', newName)
    },
    () => {
      this.fileManager.closeFile(newName)
      this.event.emit('closeFile', newName)
    })
    this.removeTab(oldName)
  }

  addTab (name, title, switchTo, close, icon) {
    if (this._handlers[name]) return

    var slash = name.split('/')
    const tabPath = slash.reverse()
    const tempTitle = []

    if (!title) {
      for (let i = 0; i < tabPath.length; i++) {
        tempTitle.push(tabPath[i])
        const formatPath = [...tempTitle].reverse()
        const index = this.loadedTabs.findIndex(({ title }) => title === formatPath.join('/'))

        if (index === -1) {
          title = formatPath.join('/')
          const titleLength = formatPath.length
          this.loadedTabs.push({
            name,
            title
          })
          formatPath.shift()
          if (formatPath.length > 0) {
            const duplicateTabName = this.loadedTabs.find(({ title }) => title === formatPath.join('/')).name
            const duplicateTabPath = duplicateTabName.split('/')
            const duplicateTabFormatPath = [...duplicateTabPath].reverse()
            const duplicateTabTitle = duplicateTabFormatPath.slice(0, titleLength).reverse().join('/')

            this.loadedTabs.push({
              name: duplicateTabName,
              title: duplicateTabTitle
            })
            this._view.filetabs.removeTab(duplicateTabName)
            this._view.filetabs.addTab({
              id: duplicateTabName,
              title: duplicateTabTitle,
              icon,
              tooltip: duplicateTabName,
              iconClass: helper.getPathIcon(duplicateTabName)
            })
          }
          break
        }
      }
    } else {
      this.loadedTabs.push({
        name,
        title
      })
    }

    this._view.filetabs.addTab({
      id: name,
      title,
      icon,
      tooltip: name,
      iconClass: helper.getPathIcon(name)
    })
    this.updateImgStyles()
    this._handlers[name] = { switchTo, close }
  }

  removeTab (name) {
    this._view.filetabs.removeTab(name)
    delete this._handlers[name]
    this.switchToActiveTab()
    this.loadedTabs = this.loadedTabs.filter(tab => tab.name !== name)
    this.updateImgStyles()
  }

  addHandler (type, fn) {
    this.handlers[type] = fn
  }

  onZoomOut () {
    this.editor.editorFontSize(-1)
  }

  onZoomIn () {
    this.editor.editorFontSize(1)
  }

  renderTabsbar () {
    this._view.filetabs = yo`<remix-tabs class=${css.remix_tabs}></remix-tabs>`
    this._view.filetabs.addEventListener('tabClosed', (event) => {
      if (this._handlers[event.detail]) this._handlers[event.detail].close()
      this.event.emit('tabCountChanged', this._view.filetabs.tabs.length)
    })
    this._view.filetabs.addEventListener('tabActivated', (event) => {
      if (this._handlers[event.detail]) this._handlers[event.detail].switchTo()
      this.event.emit('tabCountChanged', this._view.filetabs.tabs.length)
    })

    this._view.filetabs.canAdd = false

    const zoomBtns = yo`
      <div class="d-flex flex-row justify-content-center align-items-center" title="Zoom in/out">
        <span data-id="tabProxyZoomOut" class="btn btn-sm px-1 fas fa-search-minus text-dark" onclick=${() => this.onZoomOut()}></span>
        <span data-id="tabProxyZoomIn" class="btn btn-sm px-1 fas fa-search-plus text-dark" onclick=${() => this.onZoomIn()}></span>
      </div>
    `

    // @todo(#2492) remove style after the mainPanel layout fix.
    this._view.tabs = yo`
      <div  style="display: -webkit-box; max-height: 32px">
        ${zoomBtns}
        <i class="d-flex flex-row justify-content-center align-items-center far fa-sliders-v px-1" title="press F1 when focusing the editor to show advanced configuration settings"></i>
        ${this._view.filetabs}
      </div>
    `

    // tabs
    var $filesEl = $(this._view.filetabs)

    // Switch tab
    var self = this
    $filesEl.on('click', '.file:not(.active)', function (ev) {
      ev.preventDefault()
      var name = $(this).find('.name').text()
      self._handlers[name].switchTo()
      return false
    })

    // Remove current tab
    $filesEl.on('click', '.file .remove', function (ev) {
      ev.preventDefault()
      var name = $(this).parent().find('.name').text()
      self._handlers[name].close()
      return false
    })

    return this._view.tabs
  }
}
