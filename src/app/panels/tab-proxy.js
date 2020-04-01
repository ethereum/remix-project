var yo = require('yo-yo')
var $ = require('jquery')
const EventEmitter = require('events')
const globalRegistry = require('../../global/registry')

require('remix-tabs')

export class TabProxy {
  constructor (fileManager, editor, appManager) {
    this.event = new EventEmitter()
    this.fileManager = fileManager
    this.appManager = appManager
    this.editor = editor
    this.data = {}
    this._view = {}
    this._handlers = {}

    globalRegistry.get('themeModule').api.events.on('themeChanged', (theme) => {
    // update invert for all icons
      this.updateImgStyles()
    })

    fileManager.events.on('fileRemoved', (name) => {
      this.removeTab(name)
    })

    fileManager.events.on('fileClosed', (name) => {
      this.removeTab(name)
    })

    fileManager.events.on('currentFileChanged', (file) => {
      if (this._handlers[file]) {
        this._view.filetabs.activateTab(file)
        return
      }
      this.addTab(file, '', () => {
        this.fileManager.switchFile(file)
        this.event.emit('switchFile', file)
      },
      () => {
        this.fileManager.closeFile(file)
        this.event.emit('closeFile', file)
      })
    })

    fileManager.events.on('fileRenamed', (oldName, newName, isFolder) => {
      if (isFolder) return
      // should change the tab title too
      this.addTab(newName, '', () => {
        this.fileManager.switchFile(newName)
        this.event.emit('switchFile', newName)
      },
      () => {
        this.fileManager.closeFile(newName)
        this.event.emit('closeFile', newName)
      })
      this.removeTab(oldName)
    })

    appManager.event.on('activate', ({ name, location, displayName, icon }) => {
      if (location === 'mainPanel') {
        this.addTab(
          name,
          displayName,
          () => this.event.emit('switchApp', name),
          () => {
            this.event.emit('closeApp', name)
            this.appManager.deactivatePlugin(name)
          },
          icon
        )
        this.switchTab(name)
      }
    })

    appManager.event.on('deactivate', (profile) => {
      this.removeTab(profile.name)
    })

    appManager.event.on('ensureActivated', (name) => {
      if (name === 'home') {
        // if someone force activation of home, we switch to it
        this.event.emit('switchApp', name)
        this._view.filetabs.activateTab(name)
      }
    })
  }
  updateImgStyles () {
    const images = this._view.filetabs.getElementsByClassName('image')
    if (images.length !== 0) {
      for (let element of images) {
        globalRegistry.get('themeModule').api.fixInvert(element)
      };
    }
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

  addTab (name, title, switchTo, close, icon) {
    if (this._handlers[name]) return

    var slash = name.split('/')
    if (!title) {
      title = name.indexOf('/') !== -1 ? slash[slash.length - 1] : name
    }
    this._view.filetabs.addTab({
      id: name,
      title,
      icon,
      tooltip: name
    })
    this.updateImgStyles()
    this._handlers[name] = { switchTo, close }
  }

  removeTab (name) {
    this._view.filetabs.removeTab(name)
    delete this._handlers[name]
    this.switchToActiveTab()
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
    this._view.filetabs = yo`<remix-tabs></remix-tabs>`
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
      <div class="d-flex flex-row justify-content-center align-items-center">
        <span data-id="tabProxyZoomOut" class="btn btn-sm px-1 fas fa-search-minus text-dark" onclick=${() => this.onZoomOut()}></span>
        <span data-id="tabProxyZoomIn" class="btn btn-sm px-1 fas fa-search-plus text-dark" onclick=${() => this.onZoomIn()}></span>
      </div>
    `

    // @todo(#2492) remove style after the mainPanel layout fix.
    this._view.tabs = yo`
      <div  style="display: -webkit-box; min-height: 35px">
        ${zoomBtns}
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
