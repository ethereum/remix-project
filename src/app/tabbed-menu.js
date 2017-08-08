var $ = require('jquery')

module.exports = tabbedMenu

function tabbedMenu (container, appAPI, events, opts) {
  var lis = container.querySelectorAll('li')
  for (var li = 0; li < lis.length; ++li) {
    lis[li].onclick = function (ev) { selectTab(this) }
  }

  events.app.register('debuggingRequested', () => {
    selectTab(container.querySelector('li.debugView'))
  })

  // initialize tabbed menu
  selectTab(container.querySelector('.compileView'))

  // select tab
  function selectTab (el) {
    el = $(el)
    var match = /[a-z]+View/.exec(el.get(0).className)
    if (!match) return
    var cls = match[0]
    if (!el.hasClass('active')) {
      el.parent().find('li').removeClass('active')
      $('#optionViews').attr('class', '').addClass(cls)
      el.addClass('active')
    }
    events.app.trigger('tabChanged', [cls])
  }
}
