var yo = require('yo-yo')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var $ = require('jquery')

var Terminal = require('./terminal')
var Editor = require('../editor/editor')
var globalRegistry = require('../../global/registry')

var CommandInterpreter = require('../../lib/cmdInterpreter')
var ContextualListener = require('../editor/contextualListener')
var ContextView = require('../editor/contextView')
var styles = require('./styles/editor-panel-styles')
var cssTabs = styles.cssTabs
var css = styles.css

class EditorPanel {
  constructor (localRegistry) {
    var self = this
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self.event = new EventManager()
  }
  init () {
    var self = this
    self._deps = {
      config: self._components.registry.get('config').api,
      txlistener: self._components.registry.get('txlistener').api,
      fileManager: self._components.registry.get('filemanager').api,
      udapp: self._components.registry.get('udapp').api
    }
    self.data = {
      _FILE_SCROLL_DELTA: 200,
      _layout: {
        top: {
          offset: self._deps.config.get('terminal-top-offset') || 500,
          show: true
        }
      }
    }
    self._view = {}
    var editor = new Editor({})
    self._components.registry.put({api: editor, name: 'editor'})
    var contextualListener = new ContextualListener({editor: editor})
    self._components = {
      editor: editor,
      contextualListener: contextualListener,
      contextView: new ContextView({contextualListener: contextualListener, editor: editor}),
      terminal: new Terminal({
        udapp: self._deps.udapp,
        cmdInterpreter: new CommandInterpreter()
      },
        {
          getPosition: (event) => {
            var limitUp = 36
            var limitDown = 20
            var height = window.innerHeight
            var newpos = (event.pageY < limitUp) ? limitUp : event.pageY
            newpos = (newpos < height - limitDown) ? newpos : height - limitDown
            return newpos
          }
        })
    }

    self._components.terminal.event.register('filterChanged', (type, value) => {
      this.event.trigger('terminalFilterChanged', [type, value])
    })
    self._components.terminal.event.register('resize', delta => self._adjustLayout('top', delta))
    if (self._deps.txListener) {
      self._components.terminal.event.register('listenOnNetWork', (listenOnNetWork) => {
        self._deps.txListener.setListenOnNetwork(listenOnNetWork)
      })
    }
    if (document && document.head) {
      document.head.appendChild(cssTabs)
    }
  }
  _adjustLayout (direction, delta) {
    var limitUp = 0
    var limitDown = 32
    var containerHeight = window.innerHeight - limitUp // - menu bar containerHeight
    var self = this
    var layout = self.data._layout[direction]
    if (layout) {
      if (delta === undefined) {
        layout.show = !layout.show
        if (layout.show) delta = layout.offset
        else delta = containerHeight
      } else {
        layout.show = true
        self._deps.config.set(`terminal-${direction}-offset`, delta)
        layout.offset = delta
      }
    }
    var tmp = delta - limitDown
    delta = tmp > 0 ? tmp : 0
    if (direction === 'top') {
      var height = containerHeight - delta
      height = height < 0 ? 0 : height
      self._view.editor.style.height = `${delta}px`
      self._view.terminal.style.height = `${height}px` // - menu bar height
      self._components.editor.resize((document.querySelector('#editorWrap') || {}).checked)
      self._components.terminal.scroll2bottom()
    }
  }
  getEditor () {
    var self = this
    return self._components.editor
  }
  refresh () {
    var self = this
    self._view.tabs.onmouseenter()
  }
  log (data = {}) {
    var self = this
    var command = self._components.terminal.commands[data.type]
    if (typeof command === 'function') command(data.value)
  }
  logMessage (msg) {
    var self = this
    self.log({type: 'log', value: msg})
  }
  logHtmlMessage (msg) {
    var self = this
    self.log({type: 'html', value: msg})
  }
  render () {
    var self = this
    if (self._view.el) return self._view.el
    self._view.editor = self._components.editor.render()
    self._view.terminal = self._components.terminal.render()
    self._view.content = yo`
      <div class=${css.content}>
        ${self._renderTabsbar()}
        <div class=${css.contextviewcontainer}>
          ${self._components.contextView.render()}
        </div>
        ${self._view.editor}
        ${self._view.terminal}
      </div>
    `
    self._view.el = yo`
      <div class=${css.editorpanel}>
        ${self._view.content}
      </div>
    `
    // INIT
    self._adjustLayout('top', self.data._layout.top.offset)
    return self._view.el
  }
  registerCommand (name, command, opts) {
    var self = this
    return self._components.terminal.registerCommand(name, command, opts)
  }
  updateTerminalFilter (filter) {
    this._components.terminal.updateJournal(filter)
  }
  _renderTabsbar () {
    var self = this
    if (self._view.tabsbar) return self._view.tabsbar
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
    self._view.tabsbar = yo`
      <div class=${css.tabsbar}>
        <div class=${css.buttons}>
          <span class=${css.toggleLHP} onclick=${toggleLHP} title="Toggle left hand panel">
            <i class="fa fa-angle-double-left"></i>
          </span>
          <span class=${css.changeeditorfontsize} >
            <i class="increditorsize fa fa-plus" onclick=${increase} aria-hidden="true" title="increase editor font size"></i>
            <i class="decreditorsize fa fa-minus" onclick=${decrease} aria-hidden="true" title="decrease editor font size"></i>
          </span>
        </div>
        ${self._view.tabs}
        <span class="${css.toggleRHP}" onclick=${toggleRHP} title="Toggle right hand panel">
          <i class="fa fa-angle-double-right"></i>
        </span>
      </div>
    `

    // tabs
    var $filesEl = $(self._view.filetabs)

    // Switch tab
    $filesEl.on('click', '.file:not(.active)', function (ev) {
      ev.preventDefault()
      self._deps.fileManager.switchFile($(this).find('.name').text())
      return false
    })

    // Remove current tab
    $filesEl.on('click', '.file .remove', function (ev) {
      ev.preventDefault()
      var name = $(this).parent().find('.name').text()
      delete self._deps.fileManager.tabbedFiles[name]
      self._deps.fileManager.refreshTabs()
      if (Object.keys(self._deps.fileManager.tabbedFiles).length) {
        self._deps.fileManager.switchFile(Object.keys(self._deps.fileManager.tabbedFiles)[0])
      } else {
        self._deps.editor.displayEmptyReadOnlySession()
        self._deps.config.set('currentFile', '')
      }
      return false
    })

    return self._view.tabsbar
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
    function toggleLHP (event) {
      this.children[0].classList.toggle('fa-angle-double-right')
      this.children[0].classList.toggle('fa-angle-double-left')
      self.event.trigger('resize', ['left'])
    }
    function toggleRHP (event) {
      this.children[0].classList.toggle('fa-angle-double-right')
      this.children[0].classList.toggle('fa-angle-double-left')
      self.event.trigger('resize', ['right'])
    }
    function increase () { self._components.editor.editorFontSize(1) }
    function decrease () { self._components.editor.editorFontSize(-1) }
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

module.exports = EditorPanel
