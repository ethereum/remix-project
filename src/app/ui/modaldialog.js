var yo = require('yo-yo')
var css = require('./styles/modaldialog-styles')

module.exports = (title, content, ok, cancel, focusSelector, opts) => {
  opts = opts || {}
  var container = document.querySelector(`.${css.modal}`)
  if (!container) {
    document.querySelector('body').appendChild(html(opts))
    container = document.querySelector(`.${css.modal}`)
  }

  var closeDiv = document.getElementById('modal-close')
  if (opts.hideClose) closeDiv.style.display = 'none'

  var okDiv = document.getElementById('modal-footer-ok')
  okDiv.innerHTML = (ok && ok.label !== undefined) ? ok.label : 'OK'
  okDiv.style.display = okDiv.innerHTML === '' ? 'none' : 'inline-block'

  var cancelDiv = document.getElementById('modal-footer-cancel')
  cancelDiv.innerHTML = (cancel && cancel.label !== undefined) ? cancel.label : 'Cancel'
  cancelDiv.style.display = cancelDiv.innerHTML === '' ? 'none' : 'inline-block'

  var modal = document.querySelector(`.${css.modalBody}`)
  var modalTitle = document.querySelector(`.${css.modalHeader} h3`)

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
    if (container) {
      container.class = css.modal
      container = null
    }
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
    if (container) container.style.display = 'none'
  }

  function show () {
    if (!container) return
    container.style.display = 'block'
    if (focusSelector) {
      const focusTarget = document.querySelector(`.${css.modal} ${focusSelector}`)
      if (focusTarget) {
        focusTarget.focus()
        if (typeof focusTarget.setSelectionRange === 'function') {
          focusTarget.setSelectionRange(0, focusTarget.value.length)
        }
      }
    }
  }

  function removeEventListener () {
    okDiv.removeEventListener('click', okListener)
    cancelDiv.removeEventListener('click', cancelListener)
    closeDiv.removeEventListener('click', cancelListener)
    document.removeEventListener('keydown', modalKeyEvent)
    if (document.getElementById('modal-background')) {
      document.getElementById('modal-background').removeEventListener('click', cancelListener)
    }
  }
  okDiv.addEventListener('click', okListener)
  cancelDiv.addEventListener('click', cancelListener)
  closeDiv.addEventListener('click', cancelListener)
  document.addEventListener('keydown', modalKeyEvent)
  if (document.getElementById('modal-background')) {
    document.getElementById('modal-background').addEventListener('click', cancelListener)
  }
  return { container, okListener, cancelListener }
}

function html (opts) {
  return yo`<div id="modal-dialog" class="${css.modal}">
  <div id="modal-background" class="${css['modalBackground']}"> </div>
  <div class="${css['modalContent']} bg-light text-secondary ${opts.class}">
    <div class="${css['modalHeader']}">
    <h3></h3>
    <i id="modal-close" title="Close" class="fa fa-times ${css['modalClose']}" aria-hidden="true"></i>
  </div>
  <div class="${css['modalBody']}"> -
  </div>
  <div class="${css['modalFooter']}">
    <span id="modal-footer-ok" class="${css['modalFooterOk']} btn btn-sm btn-primary">OK</span><span id="modal-footer-cancel"  class="${css['modalFooterCancel']} btn btn-sm btn-primary">Cancel</span>
        </div>
  </div>
  </div>`
}
