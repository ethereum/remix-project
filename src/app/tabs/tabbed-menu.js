var $ = require('jquery')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.styleGuide
var styles = styleGuide()

module.exports = tabbedMenu

var css = csjs`
  li.active {
    background-color: ${styles.rightPanel.backgroundColor_Tab};
    color: ${styles.appProperties.mainText_Color};
  }
`

function tabbedMenu (container, appAPI, events, opts) {
  var lis = container.querySelectorAll('li')
  for (var li = 0; li < lis.length; ++li) {
    lis[li].onclick = function (ev) { selectTab(this) }
  }

  events.app.register('debuggingRequested', () => {
    selectTab(container.querySelector('li.debugView'))
  })

  events.rhp.register('switchTab', tabName => {
    selectTab(container.querySelector(`li.${tabName}`))
  })

  // initialize tabbed menu
  selectTab(container.querySelector('.compileView'))

  // select tab

  function selectTab (el) {
    var match = /[a-z]+View/.exec(el.className)
    if (!match) return
    var cls = match[0]
    if (!el.classList.contains(css.active)) {
      var nodes = el.parentNode.querySelectorAll('li')
      for (var i = 0; i < nodes.length; ++i) {
        nodes[i].classList.remove(css.active)
      }
      $('#optionViews').attr('class', '').addClass(cls)
      el.classList.add(css.active)
    }
    events.app.trigger('tabChanged', [cls])
  }
}
