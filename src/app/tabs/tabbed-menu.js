var yo = require('yo-yo')
var css = require('./styles/tabbed-menu-styles')

var globalRegistry = require('../../global/registry')
var helper = require('../../lib/helper')

var EventManager = require('../../lib/events')

class TabbedMenu {
  constructor (localRegistry) {
    const self = this
    self.event = new EventManager()
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._deps = {
      app: self._components.registry.get('app').api
    }
    self._view = { el: null, viewport: null, tabs: {}, contents: {} }
    self._deps.app.event.register('debuggingRequested', () => {
      self.selectTabByTitle('Debugger')
    })
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
  removeTabByTitle (title) {
    const self = this
    if (self._view.tabs[title]) {
      self._view.tabs[title].parentNode.removeChild(self._view.tabs[title])
    }
    if (self._view.contents[title]) {
      self._view.contents[title].parentNode.removeChild(self._view.contents[title])
    }
    delete self._view.contents[title]
    delete self._view.tabs[title]
  }
  getTabByClass (tabClass) {
    const self = this
    return self._view.el.querySelector(`li.${tabClass}`)
  }
  updateTabTitle (tabClass, title) {
    const self = this
    var tab = self.getTabByClass(tabClass)
    if (tab) tab.innerHTML = title
  }
  selectTabByTitle (title) {
    const self = this
    self.selectTab(self._view.tabs[title])
  }
  selectTabByClassName (tabClass) {
    const self = this
    var tab = self.getTabByClass(tabClass)
    if (tab) self.selectTab(tab)
    return tab
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
    self._deps.app.event.trigger('tabChanged', [title])
  }
}

module.exports = TabbedMenu
