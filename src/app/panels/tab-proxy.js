var yo = require('yo-yo')
var $ = require('jquery')

var styles = require('./styles/editor-panel-styles')
var css = styles.css

export class TabProxy {
  constructor (fileManager, editor) {
    this.fileManager = fileManager
    this.editor = editor
    this.activeEntity
    this.entities = {}
    this.data = {}
    this._view = {}

    fileManager.event.register('fileRemoved', (name) => {
      const filesEl = document.querySelector('#files')
      var file = filesEl.querySelector(`li[path="${name}"]`)
      if (file) {
        filesEl.removeChild(file)
      }
    })

    fileManager.event.register('fileClosed', (name) => {
      const filesEl = document.querySelector('#files')
      var file = filesEl.querySelector(`li[path="${name}"]`)
      if (file) {
        filesEl.removeChild(file)
      }
    })

    fileManager.event.register('currentFileChanged', (file) => {
      const filesEl = document.querySelector('#files')
      if (!filesEl.querySelector(`li[path="${file}"]`)) {
        filesEl.appendChild(yo`<li class="file" path="${file}" ><span class="name">${file}</span><span class="remove"><i class="fa fa-close"></i></span></li>`)
      }
      this.active(file)
    })

    fileManager.event.register('fileRenamed', (oldName, newName) => {
      const filesEl = document.querySelector('#files')
      var file = filesEl.querySelector(`li[path="${oldName}"]`)
      if (file) {
        filesEl.setAttribute('path', file)
        file.querySelector(`.name`).innerHTML = newName
      }
    })
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
    var self = this
    self._view.filetabs = yo`<ul id="files" class="${css.files} nav nav-tabs"></ul>`

    self._view.tabs = yo`
      <div class=${css.tabs} onmouseenter=${toggleScrollers} onmouseleave=${toggleScrollers}>
        <div onclick=${scrollLeft} class="${css.scroller} ${css.hide} ${css.scrollerleft}">
          <i class="fa fa-chevron-left "></i>
        </div>
        ${self._view.filetabs}
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
        ${self._view.tabs}
      </div>
    `

    // tabs
    var $filesEl = $(self._view.filetabs)

    // Switch tab
    $filesEl.on('click', '.file:not(.active)', function (ev) {
      ev.preventDefault()
      self.fileManager.switchFile($(this).find('.name').text())
      return false
    })

    // Remove current tab
    $filesEl.on('click', '.file .remove', function (ev) {
      ev.preventDefault()
      var name = $(this).parent().find('.name').text()
      self.fileManager.closeFile(name)
      return false
    })

    return tabsbar

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
  }
}
