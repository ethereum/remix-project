var yo = require('yo-yo')
var helper = require('../../lib/helper')

var css = require('./styles/tabbed-menu-styles')

class TabbedMenu {
  constructor (tabView, events) {
    var self = this
    this.tabView = tabView
    this.events = events
    this.tabs = {}
    this.contents = {}

    events.app.register('debuggingRequested', () => {
      self.selectTab(tabView.querySelector('li.debugView'))
    })

    events.rhp.register('switchTab', tabName => {
      self.selectTab(tabView.querySelector(`li.${tabName}`))
    })
  }

  selectTabByTitle (title) {
    this.selectTab(this.tabs[title])
  }

  selectTab (el) {
    if (!el.classList.contains(css.active)) {
      var nodes = el.parentNode.querySelectorAll('li')
      for (var i = 0; i < nodes.length; ++i) {
        nodes[i].classList.remove(css.active)
        this.contents[nodes[i].getAttribute('title')].style.display = 'none'
      }
    }
    var title = el.getAttribute('title')
    this.contents[el.getAttribute('title')].style.display = 'block'
    el.classList.add(css.active)
    this.events.app.trigger('tabChanged', [title])
  }

  addTab (title, cssClass, content) {
    var self = this
    if (!helper.checkSpecialChars(title)) {
      this.contents[title] = content
      this.tabs[title] = yo`<li class="${css.opts_li} ${css.options} ${cssClass}" onclick=${function (ev) { self.selectTab(this) }} title=${title}>${title}</li>`
      this.tabView.appendChild(this.tabs[title])
    }
  }
}

module.exports = TabbedMenu
