module.exports = (title, content, okFn, cancelFn) => {
  var modal = document.querySelector('.modal-body')
  var modaltitle = document.querySelector('.modal-header h2')

  modaltitle.innerHTML = ' - '
  if (title) modaltitle.innerHTML = title

  modal.innerHTML = ''
  if (content) modal.appendChild(content)

  var container = document.querySelector('.modal')
  container.style.display = container.style.display === 'block' ? hide() : show()

  function ok () {
    hide()
    if (okFn) okFn()
    removeEventListener()
  }

  function cancel () {
    hide()
    if (cancelFn) cancelFn()
    removeEventListener()
  }

  function blur (event) {
    if (event.target === container) {
      cancel()
    }
  }

  window.onclick = (event) => {
    console.log('clicj windo')
    blur(event)
  }

  function hide () {
    container.style.display = 'none'
  }

  function show () {
    container.style.display = 'block'
  }

  function removeEventListener () {
    document.getElementById('modal-footer-ok').removeEventListener('click', ok)
    document.getElementById('modal-footer-cancel').removeEventListener('click', cancel)
  }

  document.getElementById('modal-footer-ok').addEventListener('click', ok)
  document.getElementById('modal-footer-cancel').addEventListener('click', cancel)
}
