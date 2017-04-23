var $ = require('jquery')

module.exports = tabbedMenu

function tabbedMenu (compiler, loadingSpinner, self) {
  $('#options li').click(function (ev) {
    var $el = $(this)
    selectTab($el)
  })

  // initialize tabbed menu
  selectTab($('#options .envView'))

  // add event listeners for loading spinner
  // compiler.event.register('compilationStarted', function compilationStarted () {
  compiler.event.register('loadingCompiler', function compilationStarted () {
    var contractTab = document.querySelector('.envView')
    if (!contractTab.children.length) {
      contractTab.appendChild(loadingSpinner(function cb (finish) {
        // compiler.event.register('compilationFinished', function () {
        compiler.event.register('compilerLoaded', finish)
      }))
    }
  })
  compiler.event.register('loadingCompiler', function loadingCompiler () {
    var settingsTab = document.querySelector('.settingsView')
    if (!settingsTab.children.length) {
      settingsTab.appendChild(loadingSpinner(function cb (finish) {
        compiler.event.register('compilerLoaded', finish)
      }))
    }
  })

  // select tab
  function selectTab (el) {
    var match = /[a-z]+View/.exec(el.get(0).className)
    if (!match) return
    var cls = match[0]
    if (!el.hasClass('active')) {
      el.get(0).parentElement.querySelectorAll('li').forEach(function (li) {
        li.classList.remove('active')
      })
      $('#optionViews').attr('class', '').addClass(cls)
      el.addClass('active')
    }
    self.event.trigger('tabChanged', [cls])
  }
}
