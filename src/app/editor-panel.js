var csjs = require('csjs-inject')
var yo = require('yo-yo')
var EventManager = require('ethereum-remix').lib.EventManager

var css = csjs`
  .tabsbar             {
    display            : flex;
    overflow           : hidden;
  }
  .tabs               {
    position          : relative;
    display           : flex;
    margin            : 0;
    left              : 10px;
    margin-right      : 10px;
    width             : 100%;
    overflow          : hidden;
  }
  .files              {
    position          : relative; 
    list-style        : none;
    margin            : 0;
    font-size         : 15px;
    height            : 2.5em;
    box-sizing        : border-box;
    line-height       : 2em;
    padding           : 0.5em 0 0;
    top               : 0;
    border-bottom     : 0 none;
  }
  .changeeditorfontsize {
    margin            : 0;
  }
  .changeeditorfontsize i {
    cursor            : pointer;
    display           : block;
    color             : #111111;
  }
  .changeeditorfontsize i {
    cursor            : pointer;
  }
  .changeeditorfontsize i:hover {
    color             : orange;
  }
  .buttons            {
    display           : flex;
    flex-direction    : row;
    justify-content   : space-around;
    align-items       : center;
    min-width         : 45px;
  }
  .toggleLHP          {
    display           : flex;
    padding           : 10px;
    width             : 100%;
    font-weight       : bold;
    color             : black;
  }
  .toggleLHP i        {
    cursor            : pointer;
  }
  .toggleLHP i:hover  {
    color             : orange;
  }
  .scroller           {
    position          : absolute;
    z-index           : 999;
    text-align        : center;
    cursor            : pointer;
    padding           : 0 0.9em;
    vertical-align    : middle;
    background-color  : rgba(255, 255, 255, 0.8);
    height            : 100%;
    font-size         : 1.3em;
  }
  .scroller i         {
    line-height       : 3em;
  }
  .scrollerright      {
    right             : 0;
    margin-right      : 15px;
  }
  .scrollerleft       {
    left              : 0;
  }
  .toggleRHP          {
    margin-top        : 0.5em;
    padding           : 0.6em;
    font-weight       : bold;
    color             : black;
    right             : 0;
  }
  .toggleRHP i        {
    cursor            : pointer;
  }
  .toggleRHP i:hover  {
    color             : orange;
  }
  .show               {
    opacity           : 1;
    transition        : .3s opacity ease-in;
  }
  .hide               {
    opacity           : 0;
    pointer-events    : none;
    transition        : .3s opacity ease-in;
  }
`

class EditorPanel {
  constructor (opts = {}) {
    var self = this
    self.data = {
      _FILE_SCROLL_DELTA: 200
    }
    self._view = {}
    self._api = { editor: opts.api.editor }
    self.event = new EventManager()
    // var events = opts.events
  }
  refresh () {
    var self = this
    self._view.tabs.onmouseenter()
  }
  render () {
    var self = this
    if (self._view.el) return self._view.el
    self._view.el = [
      self._renderTabsbar(),
      self._api.editor.render()
    ]
    return self._view.el
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
    function increase () { self._api.editor.editorFontSize(1) }
    function decrease () { self._api.editor.editorFontSize(-1) }
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
