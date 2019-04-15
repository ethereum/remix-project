var yo = require('yo-yo')
var $ = require('jquery')
const EventEmitter = require('events')

require('remix-tabs')

export class TabProxy {
  constructor (fileManager, editor, appStore, appManager) {
    this.event = new EventEmitter()
    this.fileManager = fileManager
    this.appManager = appManager
    this.editor = editor
    this.data = {}
    this._view = {}
    this._handlers = {}

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

    fileManager.events.on('fileRenamed', (oldName, newName) => {
      this.removeTab(oldName)
      this.addTab(newName, '', () => {
        this.fileManager.switchFile(newName)
        this.event.emit('switchFile', newName)
      },
      () => {
        this.fileManager.closeFile(newName)
        this.event.emit('closeFile', newName)
      })
    })

    appStore.event.on('activate', (name) => {
      const { profile } = appStore.getOne(name)
      if (profile.location === 'mainPanel') {
        this.addTab(
          name,
          profile.displayName,
          () => this.event.emit('switchApp', name),
          () => {
            this.event.emit('closeApp', name)
            this.appManager.deactivateOne(name)
          }
        )
        this.switchTab(name)
      }
    })

    appStore.event.on('deactivate', (name) => {
      this.removeTab(name)
    })
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

  showTab (name) {
    this._view.filetabs.activateTab(name)
  }

  addTab (name, title, switchTo, close, kind) {
    if (this._handlers[name]) return

    var slash = name.split('/')
    if (!title) {
      title = name.indexOf('/') !== -1 ? slash[slash.length - 1] : name
    }
    this._view.filetabs.addTab({
      id: name,
      title,
      icon: '',
      tooltip: name
    })
    this._handlers[name] = { switchTo, close }
  }

  removeTab (name) {
    this._view.filetabs.removeTab(name)
    delete this._handlers[name]
  }

  addHandler (type, fn) {
    this.handlers[type] = fn
  }

  renderTabsbar () {
    this._view.filetabs = yo`<remix-tabs></remix-tabs>`
    this._view.filetabs.addEventListener('tabClosed', (event) => {
      if (this._handlers[event.detail]) this._handlers[event.detail].close()
    })
    this._view.filetabs.addEventListener('tabActivated', (event) => {
      if (this._handlers[event.detail]) this._handlers[event.detail].switchTo()
    })

    this._view.filetabs.canAdd = false

    this._view.tabs = yo`
      <div style="width: 100%; height: 100%;">
        ${this._view.filetabs}
      </div>
    `
    let tabsbar = yo`
      <div class="d-flex align-items-center" style="max-height: 35px; height: 100%">
        ${this._view.tabs}
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

    return tabsbar
  }
}
