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
    this.entities = {}
    this.data = {}
    this._view = {}
    this._handlers = {}

    fileManager.event.register('fileRemoved', (name) => {
      this.removeTab(name)
    })

    fileManager.event.register('fileClosed', (name) => {
      this.removeTab(name)
    })

    fileManager.event.register('currentFileChanged', (file) => {
      if (this._handlers[file]) {
        this._view.filetabs.activateTab(file)
        return
      }
      this.addTab(file, () => {
        this.fileManager.switchFile(file)
        this.event.emit('switchFile', file)
      },
      () => {
        this.fileManager.closeFile(file)
        this.event.emit('closeFile', file)
      })
    })

    fileManager.event.register('fileRenamed', (oldName, newName) => {
      this.removeTab(oldName)
      this.addTab(newName, () => {
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
      if (profile.prefferedLocation === 'mainPanel') {
        this.addTab(name, () => {
          this.event.emit('switchApp', name)
        }, () => {
          this.event.emit('closeApp', name)
          this.appManager.deactivateOne(name)
        })
      }
    })

    appStore.event.on('deactivate', (name) => {
      this.removeTab(name)
    })
  }

  addTab (name, switchTo, close, kind) {
    var slash = name.split('/')
    let title = name.indexOf('/') !== -1 ? slash[slash.length - 1] : name
    this._view.filetabs.addTab({
      id: name,
      title,
      icon: '',
      tooltip: name
    })
    this._handlers[name] = { switchTo, close }
  }

  removeTab (name) {
    this._view.filetabs.closeTab(name)
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
      <div>
        ${this._view.filetabs}
      </div>
    `
    let tabsbar = yo`
      <div class="d-flex">
        <div class="m-1">
          <span class="p-1">
            <i class="m-1 fa fa-plus" onclick=${increase} aria-hidden="true" title="increase editor font size"></i>
            <i class="m-1 fa fa-minus" onclick=${decrease} aria-hidden="true" title="decrease editor font size"></i>
          </span>
        </div>
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

    function increase () { self.editor.editorFontSize(1) }
    function decrease () { self.editor.editorFontSize(-1) }
    return tabsbar
  }
}
