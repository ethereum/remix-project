/* global FileReader, confirm, alert */
var yo = require('yo-yo')
var csjs = require('csjs-inject')

module.exports = (title, content, ok, cancel) => {
  var okDiv = document.getElementById('modal-footer-ok')
  var cancelDiv = document.getElementById('modal-footer-cancel')
  okDiv.innerHTML = (ok && ok.label !== undefined) ? ok.label : 'OK'
  cancelDiv.innerHTML = (cancel && cancel.label !== undefined) ? cancel.label : ''

  var modal = document.querySelector('.modal-body')
  var modaltitle = document.querySelector('.modal-header h2')

  modaltitle.innerHTML = ' - '
  if (title) modaltitle.innerHTML = title

  modal.innerHTML = ''
  //if (content) modal.appendChild(content)
  if (content) modal.innerHTML = content

  var container = document.querySelector('.modal')
  container.style.display = container.style.display === 'block' ? hide() : show()

  function okListenner () {
    hide()
    if (ok && ok.fn) ok.fn()
    removeEventListener()
  }

  function cancelListenner () {
    hide()
    if (cancel && cancel.fn) cancel.fn()
    removeEventListener()
  }

  function hide () {
    container.style.display = 'none'
  }

  function show () {
    container.style.display = 'block'
  }

  function removeEventListener () {
    okDiv.removeEventListener('click', okListenner)
    cancelDiv.removeEventListener('click', cancelListenner)
  }

  okDiv.addEventListener('click', okListenner)
  cancelDiv.addEventListener('click', cancelListenner)
}