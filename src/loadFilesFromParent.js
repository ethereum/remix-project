module.exports = (fileManager) => {
  // The event listener needs to be registered as early as possible, because the
  // parent will send the message upon the "load" event.
  let filesToLoad = null
  let loadFilesCallback = function (files) { filesToLoad = files } // will be replaced later

  window.addEventListener('message', function (ev) {
    if (typeof ev.data === typeof [] && ev.data[0] === 'loadFiles') {
      loadFilesCallback(ev.data[1])
    }
  }, false)

  // Replace early callback with instant response
  loadFilesCallback = function (files) {
    fileManager.setBatchFiles(files)
  }

  // Run if we did receive an event from remote instance while starting up
  if (filesToLoad !== null) {
    fileManager.setBatchFiles(filesToLoad)
  }
}
