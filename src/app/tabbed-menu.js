var $ = require('jquery')
var loadingSpinner = require('./loading-spinner')

module.exports = tabbedMenu

function tabbedMenu (container, appAPI, events, opts) {
  $('#options li').click(function (ev) {
    var $el = $(this)
    selectTab($el)
  })

  events.app.register('debuggingRequested', () => {
    selectTab($('ul#options li.debugView'))
  })

  // initialize tabbed menu
  selectTab($('#options .envView'))

  // add event listeners for loading spinner
  events.compiler.register('loadingCompiler', function start () {
    var settingsTab = document.querySelector('.settingsView')
    if (settingsTab.children.length) return

    var spinner = loadingSpinner()
    settingsTab.appendChild(spinner)

    appAPI.warnCompilerLoading('Solidity compiler is currently loading. Please wait a moment...')
    events.compiler.register('compilerLoaded', finish)
    function finish () {
      events.compiler.unregister('compilerLoaded', finish)
      settingsTab.removeChild(spinner)
    }
  })

  // select tab
  function selectTab (el) {
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
