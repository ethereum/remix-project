var yo = require('yo-yo')
var css = require('./styles/modaldialog-styles')

module.exports = (title, content, ok, cancel) => {
  var container = document.querySelector(`.${css.modal}`)
  if (!container) {
    document.querySelector('body').appendChild(html())
    container = document.querySelector(`.${css.modal}`)
  }

  var closeDiv = document.getElementById('modal-close')

  var okDiv = document.getElementById('modal-footer-ok')
  okDiv.innerHTML = (ok && ok.label !== undefined) ? ok.label : 'OK'

  var cancelDiv = document.getElementById('modal-footer-cancel')
  cancelDiv.innerHTML = (cancel && cancel.label !== undefined) ? cancel.label : 'Cancel'

  var modal = document.querySelector(`.${css.modalBody}`)
  var modalTitle = document.querySelector(`.${css.modalHeader} h2`)

  modalTitle.innerHTML = ''
  if (title) modalTitle.innerHTML = title

  modal.innerHTML = ''
  if (content) modal.appendChild(content)

  show()

  function okListener () {
    removeEventListener()
    hide()
    if (ok && ok.fn) ok.fn()
  }

  function cancelListener () {
    removeEventListener()
    hide()
    if (cancel && cancel.fn) cancel.fn()
  }

  function modalKeyEvent (e) {
    if (e.keyCode === 27) {
      cancelListener()
    } else if (e.keyCode === 13) {
      e.preventDefault()
      okListener()
    }
  }

  function hide () {
    container.style.display = 'none'
  }

  function show () {
    container.style.display = 'block'
  }

  function removeEventListener () {
    okDiv.removeEventListener('click', okListener)
    cancelDiv.removeEventListener('click', cancelListener)
    closeDiv.removeEventListener('click', cancelListener)
    document.removeEventListener('keydown', modalKeyEvent)
    document.getElementById('modal-background').removeEventListener('click', cancelListener)
  }
  okDiv.addEventListener('click', okListener)
  cancelDiv.addEventListener('click', cancelListener)
  closeDiv.addEventListener('click', cancelListener)
  document.addEventListener('keydown', modalKeyEvent)
  document.getElementById('modal-background').addEventListener('click', cancelListener)
}

function html () {
  return yo`<div id="modal-dialog" class="${css.modal}">
  <div id="modal-background" class="${css['modalBackground']}"> </div>
  <div class="${css['modalContent']}">
    <div class="${css['modalHeader']}">
    <h2></h2>
    <i id="modal-close" title="Close" class="fa fa-times ${css['modalClose']}" aria-hidden="true"></i>
  </div>
  <div class="${css['modalBody']}"> -
  </div>
  <div class="${css['modalFooter']}">
    <span id="modal-footer-ok" class=${css['modalFooterOk']}>OK</span><span id="modal-footer-cancel"  class=${css['modalFooterCancel']}>Cancel</span>
        </div>
  </div>
  </div>`
}
