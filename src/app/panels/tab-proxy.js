var yo = require('yo-yo')
var $ = require('jquery')
const EventEmitter = require('events')

var styles = require('./styles/editor-panel-styles')
var css = styles.css

export class TabProxy {
  constructor (fileManager, editor, appStore, appManager) {
    this.event = new EventEmitter()
    this.fileManager = fileManager
    this.appManager = appManager
    this.editor = editor
    this.activeEntity
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
      const filesEl = document.querySelector('#files')
      if (!filesEl.querySelector(`li[path="${file}"]`)) {
        this.addTab(file, () => {
          this.fileManager.switchFile(file)
          this.event.emit('switchFile', file)
        },
        () => {
          this.fileManager.closeFile(file)
          this.event.emit('closeFile', file)
        })
      }
      this.active(file) // this put the css class "active"
    })

    fileManager.event.register('fileRenamed', (oldName, newName) => {
      const filesEl = document.querySelector('#files')
      var file = filesEl.querySelector(`li[path="${oldName}"]`)
      if (file) {
        filesEl.setAttribute('path', file)
        file.querySelector(`.name`).innerHTML = newName
      }
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
    const filesEl = document.querySelector('#files')
    filesEl.appendChild(yo`<li class="file" path="${name}" ><span class="name">${name}</span><span class="remove"><i class="fa fa-close"></i></span></li>`)
    this._handlers[name] = { switchTo, close }
  }

  removeTab (name) {
    const filesEl = document.querySelector('#files')
    var file = filesEl.querySelector(`li[path="${name}"]`)
    if (file) {
      filesEl.removeChild(file)
      delete this._handlers[name]
    }
  }

  active (name) {
    var filesEl = document.querySelector('#files')
    let file = filesEl.querySelector(`li[path="${this.activeEntity}"]`)
    if (file) $(file).removeClass('active')
    if (name) {
      let active = filesEl.querySelector(`li[path="${name}"]`)
      if (active) {
        $(active).addClass('active')
        this.activeEntity = name
      }
    }
  }

  addHandler (type, fn) {
    this.handlers[type] = fn
  }

  renderTabsbar () {
    this._view.filetabs = yo`<ul id="files" class="${css.files} nav nav-tabs"></ul>`

    this._view.tabs = yo`
      <div class=${css.tabs} onmouseenter=${toggleScrollers} onmouseleave=${toggleScrollers}>
        <div onclick=${scrollLeft} class="${css.scroller} ${css.hide} ${css.scrollerleft}">
          <i class="fa fa-chevron-left "></i>
        </div>
        ${this._view.filetabs}
        <div onclick=${scrollRight} class="${css.scroller} ${css.hide} ${css.scrollerright}">
           <i class="fa fa-chevron-right "></i>
        </div>
      </div>
    `
    let tabsbar = yo`
      <div class=${css.tabsbar}>
        <div class=${css.buttons}>
          <span class=${css.changeeditorfontsize} >
            <i class="increditorsize fa fa-plus" onclick=${increase} aria-hidden="true" title="increase editor font size"></i>
            <i class="decreditorsize fa fa-minus" onclick=${decrease} aria-hidden="true" title="decrease editor font size"></i>
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
      self.active(name)
      return false
    })

    // Remove current tab
    $filesEl.on('click', '.file .remove', function (ev) {
      ev.preventDefault()
      var name = $(this).parent().find('.name').text()
      self._handlers[name].close()
      return false
    })

    function toggleScrollers (event = {}) {
      if (event.type) self.data._focus = event.type
      var isMouseEnter = self.data._focus === 'mouseenter'
      var leftArrow = this.children[0]
      var rightArrow = this.children[2]
      if (isMouseEnter && this.children[1].offsetWidth > this.offsetWidth) {
        var hiddenLength = self._view.filetabs.offsetWidth - self._view.tabs.offsetWidth
        var currentLeft = self._view.filetabs.offsetLeft || 0
        var hiddenRight = hiddenLength + currentLeft
        if (currentLeft < 0) {
          leftArrow.classList.add(css.show)
          leftArrow.classList.remove(css.hide)
        }
        if (hiddenRight > 0) {
          rightArrow.classList.add(css.show)
          rightArrow.classList.remove(css.hide)
        }
      } else {
        leftArrow.classList.remove(css.show)
        leftArrow.classList.add(css.hide)
        rightArrow.classList.remove(css.show)
        rightArrow.classList.add(css.hide)
      }
    }
    function increase () { self.editor.editorFontSize(1) }
    function decrease () { self.editor.editorFontSize(-1) }
    function scrollLeft (event) {
      var leftArrow = this
      var rightArrow = this.nextElementSibling.nextElementSibling
      var currentLeft = self._view.filetabs.offsetLeft || 0
      if (currentLeft < 0) {
        rightArrow.classList.add(css.show)
        rightArrow.classList.remove(css.hide)
        if (currentLeft < -self.data._FILE_SCROLL_DELTA) {
          self._view.filetabs.style.left = `${currentLeft + self.data._FILE_SCROLL_DELTA}px`
        } else {
          self._view.filetabs.style.left = `${currentLeft - currentLeft}px`
          leftArrow.classList.remove(css.show)
          leftArrow.classList.add(css.hide)
        }
      }
    }

    function scrollRight (event) {
      var rightArrow = this
      var leftArrow = this.previousElementSibling.previousElementSibling
      var hiddenLength = self._view.filetabs.offsetWidth - self._view.tabs.offsetWidth
      var currentLeft = self._view.filetabs.offsetLeft || 0
      var hiddenRight = hiddenLength + currentLeft
      if (hiddenRight > 0) {
        leftArrow.classList.add(css.show)
        leftArrow.classList.remove(css.hide)
        if (hiddenRight > self.data._FILE_SCROLL_DELTA) {
          self._view.filetabs.style.left = `${currentLeft - self.data._FILE_SCROLL_DELTA}px`
        } else {
          self._view.filetabs.style.left = `${currentLeft - hiddenRight}px`
          rightArrow.classList.remove(css.show)
          rightArrow.classList.add(css.hide)
        }
      }
    }

    return tabsbar
  }
}
