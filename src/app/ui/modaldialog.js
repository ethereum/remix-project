var yo = require('yo-yo')
var csjs = require('csjs-inject')
var styleGuide = require('../../style-guide')
var styles = styleGuide()

var css = csjs`
  .modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1000; /* Sit on top of everything including the dragbar */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: ${styles.colors.black}; /* Fallback color */
    background-color: ${styles.colors.opacityBlack}; /* Black w/ opacity */
  }
  .modalHeader {
    padding: 2px 16px;
    background-color: ${styles.colors.orange};
    color: ${styles.colors.white};
  }
  .modalBody {
    padding: 1.5em;
    line-height: 1.5em;
  }
  .modalFooter {
    padding: 10px 30px;
    background-color: ${styles.colors.orange};
    color: ${styles.colors.white};
    text-align: right;
    font-weight: 700;
    cursor: pointer;
  }
  .modalContent {
    position: relative;
    background-color: ${styles.colors.white};
    margin: auto;
    padding: 0;
    line-height: 18px;
    font-size: 12px;
    border: 1px solid ${styles.colors.grey};
    width: 50%;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
    -webkit-animation-name: animatetop;
    -webkit-animation-duration: 0.4s;
    animation-name: animatetop;
    animation-duration: 0.4s
  }
  .modalFooterOk {
    cursor: pointer;
  }
  .modalFooterCancel {
    cursor: pointer;
  }
  @-webkit-keyframes animatetop {
    from {top: -300px; opacity: 0}
    to {top: 0; opacity: 1}
  }
  @keyframes animatetop {
    from {top: -300px; opacity: 0}
    to {top: 0; opacity: 1}
  }
`

module.exports = (title, content, ok, cancel) => {
  var container = document.querySelector(`.${css.modal}`)
  if (!container) {
    document.querySelector('body').appendChild(html())
    container = document.querySelector(`.${css.modal}`)
  }

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

  container.style.display = container.style.display === 'block' ? hide() : show()

  function okListener () {
    hide()
    if (ok && ok.fn) ok.fn()
    removeEventListener()
  }

  function cancelListener () {
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
    okDiv.removeEventListener('click', okListener)
    cancelDiv.removeEventListener('click', cancelListener)
  }

  okDiv.addEventListener('click', okListener)
  cancelDiv.addEventListener('click', cancelListener)
}

function html () {
  return yo`<div id="modal-dialog" class="${css.modal}" onclick="clickModal()" >
  <div class="${css['modalContent']}">
    <div class="${css['modalHeader']}">
    <h2></h2>
  </div>
  <div class="${css['modalBody']}"> -
  </div>
  <div class="${css['modalFooter']}">
    <span id="modal-footer-ok" class="modalFooterOk">OK</span><span id="modal-footer-cancel" class="modalFooterCancel">Cancel</span>
        </div>
  </div>
  </div>
  </div>`
}
