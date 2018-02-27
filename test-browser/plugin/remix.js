
function receiveMessage (event) {
  console.log('receiveMessage', event.data, event.source, event.origin)
  document.getElementById('compilationdata').innerHTML += event.data + '<br>'
}
window.addEventListener('message', receiveMessage, false)

window.onload = function () {
  document.querySelector('input#testmessageadd').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      type: 'setConfig',
      arguments: [document.getElementById('filename').value, document.getElementById('valuetosend').value],
      id: 34
    }), 'http://127.0.0.1:8080')
  })

  document.querySelector('input#testmessageremove').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      type: 'removeConfig',
      arguments: [document.getElementById('filename').value],
      id: 35
    }), 'http://127.0.0.1:8080')
  })

  document.querySelector('input#testmessagerget').addEventListener('click', function () {
    window.parent.postMessage(JSON.stringify({
      type: 'getConfig',
      arguments: [document.getElementById('filename').value],
      id: 36
    }), 'http://127.0.0.1:8080')
  })
}
