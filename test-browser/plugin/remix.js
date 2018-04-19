
function receiveMessage (event) {
  console.log('receiveMessage', event.data, event.source, event.origin)
  document.getElementById('compilationdata').innerHTML += event.data + '<br>'
}
window.addEventListener('message', receiveMessage, false)

window.onload = function () {
  document.querySelector('input#testmessageadd').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'config',
      type: 'setConfig',
      value: [document.getElementById('filename').value, document.getElementById('valuetosend').value],
      id: 34
    }), '*')
  })

  document.querySelector('input#testmessageremove').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'config',
      type: 'removeConfig',
      value: [document.getElementById('filename').value],
      id: 35
    }), '*')
  })

  document.querySelector('input#testmessagerget').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key: 'config',
      type: 'getConfig',
      value: [document.getElementById('filename').value],
      id: 36
    }), '*')
  })
}
