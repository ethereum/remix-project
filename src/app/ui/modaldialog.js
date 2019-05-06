var yo = require('yo-yo')
var css = require('./styles/modaldialog-styles')

module.exports = (title, content, ok, cancel, focusSelector, opts) => {
  let agreed = true
  let footerIsActive = true
  opts = opts || {}
  var container = document.querySelector(`.modal`)
  if (!container) {
    document.querySelector('body').appendChild(html(opts))
    container = document.querySelector(`.modal`)
  }

  var closeDiv = document.getElementById('modal-close')
  if (opts.hideClose) closeDiv.style.display = 'none'

  var okDiv = document.getElementById('modal-footer-ok')
  okDiv.innerHTML = (ok && ok.label !== undefined) ? ok.label : 'OK'
  okDiv.style.display = okDiv.innerHTML === '' ? 'none' : 'inline-block'

  var cancelDiv = document.getElementById('modal-footer-cancel')
  cancelDiv.innerHTML = (cancel && cancel.label !== undefined) ? cancel.label : 'Cancel'
  cancelDiv.style.display = cancelDiv.innerHTML === '' ? 'none' : 'inline-block'

  var modal = document.querySelector(`.modal-body`)
  var modalTitle = document.querySelector(`.modal-header h6`)

  modalTitle.innerHTML = ''
  if (title) modalTitle.innerText = title

  modal.innerHTML = ''
  if (content) modal.appendChild(content)

  setFocusOn('ok')

  show()

  function setFocusOn (btn) {
    var okDiv = document.getElementById('modal-footer-ok')
    var cancelDiv = document.getElementById('modal-footer-cancel')
    if (btn === 'ok') {
      okDiv.className = okDiv.className.replace(/\bbtn-light\b/g, 'btn-dark')
      cancelDiv.className = cancelDiv.className.replace(/\bbtn-dark\b/g, 'btn-light')
    } else {
      cancelDiv.className = cancelDiv.className.replace(/\bbtn-light\b/g, 'btn-dark')
      okDiv.className = okDiv.className.replace(/\bbtn-dark\b/g, 'btn-light')
    }
  }

  function okListener () {
    removeEventListener()
    hide()
    if (ok && ok.fn && agreed) ok.fn()
  }

  function cancelListener () {
    removeEventListener()
    hide()
    if (cancel && cancel.fn) cancel.fn()
    if (container) {
      container.class = `modal`
      container = null
    }
  }

  function modalKeyEvent (e) {
    if (e.keyCode === 27) { // Esc
      cancelListener()
    } else if (e.keyCode === 13) { // Enter
      e.preventDefault()
      okListener()
    } else if (e.keyCode === 37 && footerIsActive) { // Arrow Left
      e.preventDefault()
      agreed = true
      setFocusOn('ok')
    } else if (e.keyCode === 39 && footerIsActive) { // Arrow Right
      e.preventDefault()
      agreed = false
      setFocusOn('cancel')
    }
  }

  function hide () {
    if (container) container.style.display = 'none'
  }

  function show () {
    if (!container) return
    container.style.display = 'block'
    if (focusSelector) {
      const focusTarget = document.querySelector(`.modal ${focusSelector}`)
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

  let modalDialog = document.getElementById('modal-dialog')
  if (modalDialog) {
    modalDialog.addEventListener('click', (e) => {
      footerIsActive = document.activeElement === modalDialog
      if (e.toElement === modalDialog) {
        cancelListener() // click is outside of modal-content
      }
    })
  }
  return { container, okListener, cancelListener }
}

function html (opts) {
  return yo`
  <div id="modal-dialog" class="modal" tabindex="-1" role="dialog">
    <div id="modal-background" class="modal-dialog" role="document">
      <div class="modal-content ${css.modalContent} ${opts.class}">
        <div class="modal-header">
          <h6 class="modal-title"></h6>
          <span class="modal-close">
            <i id="modal-close" title="Close" class="fas fa-times" aria-hidden="true"></i>
          </span>
        </div>
        <div class="modal-body ${css.modalBody}"> - </div>
        <div class="modal-footer" autofocus>
          <span id="modal-footer-ok" class="${css['modalFooterOk']} modal-ok btn btn-sm btn-light" tabindex='5'>OK</span>
          <span id="modal-footer-cancel" class="${css['modalFooterCancel']} modal-cancel btn btn-sm btn-light" tabindex='10' data-dismiss="modal">Cancel</span>
        </div>
      </div>
    </div>
  </div>`
}
