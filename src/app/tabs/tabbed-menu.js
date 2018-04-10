var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')

var helper = require('../../lib/helper')
var styles = require('../ui/styles-guide/theme-chooser').chooser()

var EventManager = remixLib.EventManager

module.exports = class TabbedMenu {
  constructor (api = {}, events = {}, opts = {}) {
    const self = this
    self.event = new EventManager()
    self._opts = opts
    self._api = api
    self._events = events
    self._view = { el: null, viewport: null, tabs: {}, contents: {} }
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el
    self._view.el = yo`<ul class=${css.menu}>${Object.values(self._view.tabs)}</ul>`
    return self._view.el
  }
  renderViewport () {
    const self = this
    if (self._view.viewport) return self._view.viewport
    self._view.viewport = yo`
      <div id="optionViews" class=${css.optionViews}>
        ${Object.values(self._view.contents)}
      </div>`
    return self._view.viewport
  }
  addTab (title, cssClass, content) {
    const self = this
    if (helper.checkSpecialChars(title)) return
    if (self._view.contents[title] || self._view.tabs[title]) throw new Error('tab already exists')
    self._view.contents[title] = content
    self._view.tabs[title] = yo`<li class="${css.options} ${cssClass}" onclick=${function (ev) { self.selectTab(this) }} title=${title}>${title}</li>`
    if (self._view.el) self._view.el.appendChild(self._view.tabs[title])
    if (self._view.viewport) self._view.viewport.appendChild(self._view.contents[title])
  }
  selectTabByTitle (title) {
    const self = this
    self.selectTab(self._view.tabs[title])
  }
  selectTabByClassName (tabClass) {
    const self = this
    self.selectTab(self._view.el.querySelector(`li.${tabClass}`))
  }
  selectTab (el) {
    const self = this
    if (!el.classList.contains(css.active)) {
      var nodes = Object.values(self._view.tabs)
      for (var i = 0; i < nodes.length; ++i) {
        nodes[i].classList.remove(css.active)
        self._view.contents[nodes[i].getAttribute('title')].style.display = 'none'
      }
    }
    var title = el.getAttribute('title')
    self._view.contents[el.getAttribute('title')].style.display = 'block'
    el.classList.add(css.active)
    self._events.app.trigger('tabChanged', [title])
  }
}

const css = csjs`
  li.active {
    background-color: ${styles.rightPanel.backgroundColor_Tab};
    color: ${styles.appProperties.mainText_Color}
  }
  .options {
    float: left;
    padding-top: 0.7em;
    min-width: 60px;
    font-size: 0.9em;
    cursor: pointer;
    font-size: 1em;
    text-align: center;
  }
  .opts {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .opts_li {
    display: block;
    font-weight: bold;
    color: ${styles.rightPanel.text_Teriary}
  }
  .opts_li.active {
    color: ${styles.rightPanel.text_Primary}
  }
  .opts_li:hover {
    color: ${styles.rightPanel.icon_HoverColor_TogglePanel}
  }
`
