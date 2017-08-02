/* global alert */
var csjs = require('csjs-inject')
var yo = require('yo-yo')

var EventManager = require('ethereum-remix').lib.EventManager
var FileExplorer = require('./file-explorer')
var modalDialog = require('./modaldialog')

module.exports = filepanel

var css = csjs`
  .container {
    display           : flex;
    flex-direction    : row;
    width             : 100%;
    height            : 100%;
    box-sizing        : border-box;
  }
  .fileexplorer       {
    display           : flex;
    flex-direction    : column;
    position          : relative;
    width             : 100%;
  }
  .menu               {
    display           : flex;
    flex-direction    : row;
  }
  .newFile            {
    padding           : 10px;
  }
  .newFile i          {
    cursor            : pointer;
  }
  .newFile i:hover    {
    color             : orange;
  }
  .connectToLocalhost {
    padding           : 10px;
  }
  .connectToLocalhost i {
    cursor            : pointer;
  }
  .connectToLocalhost i:hover   {
    color             : orange;
  }
  .uploadFile         {
    padding           : 10px;
  }
  .uploadFile label:hover   {
    color             : orange;
  }
  .uploadFile label   {
    cursor            : pointer;
  }
  .treeview {
    background-color  : white;
  }
  .dragbar            {
    position          : absolute;
    top               : 37px;
    width             : 0.5em;
    right             : 0;
    bottom            : 0;
    cursor            : col-resize;
    z-index           : 999;
    border-right      : 2px solid hsla(215, 81%, 79%, .3);
  }
  .ghostbar           {
    width             : 3px;
    background-color  : #C6CFF7;
    opacity           : 0.5;
    position          : absolute;
    cursor            : col-resize;
    z-index           : 9999;
    top               : 0;
    bottom            : 0;
  }
`

var limit = 60
var canUpload = window.File || window.FileReader || window.FileList || window.Blob
var ghostbar = yo`<div class=${css.ghostbar}></div>`

function filepanel (appAPI, filesProvider) {
  var self = this
  var fileExplorer = new FileExplorer(appAPI, filesProvider['browser'])
  var fileSystemExplorer = new FileExplorer(appAPI, filesProvider['localhost'])
  var dragbar = yo`<div onmousedown=${mousedown} class=${css.dragbar}></div>`

  function remixdDialog () {
    return yo`<div><div>This feature allows to interact with your file system from Remix. Once the connection is made the shared folder will be available in the file explorer under <i>localhost</i></div>
              <div><i>Remixd</i> first has to be run in your local computer. See <a target="_blank" href="http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html">http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html</a> for more details.</div>
              <div>Accepting this dialog will start a session between <i>${window.location.href}</i> and your local file system <i>ws://127.0.0.1:65520</i></div>
              <div>Please be sure your system is secured enough (port 65520 neither opened nor forwarded).</div>
              <div><i class="fa fa-link"></i> will update the connection status.</div>
              <div>This feature is still alpha, we recommend to keep a copy of the shared folder.</div>
              </div>`
  }

  function template () {
    return yo`
      <div class=${css.container}>
        <div class=${css.fileexplorer}>
          <div class=${css.menu}>
            <span onclick=${createNewFile} class="newFile ${css.newFile}" title="Create New File in the Browser Storage Explorer">
              <i class="fa fa-plus-circle"></i>
            </span>            
            ${canUpload ? yo`
              <span class=${css.uploadFile} title="Add Local file to the Browser Storage Explorer">
                <label class="fa fa-folder-open">
                  <input type="file" onchange=${uploadFile} multiple />
                </label>
              </span>
            ` : ''}
            <span onclick=${connectToLocalhost} class="${css.connectToLocalhost}">
              <i class="websocketconn fa fa-link" title="Connect to Localhost"></i>
            </span>
          </div>
          <div class=${css.treeview}>${fileExplorer.init()}</div>
          <div class="filesystemexplorer ${css.treeview}"></div>
        </div>
        ${dragbar}
      </div>
    `
  }

  var event = new EventManager()
  self.event = event
  var element = template()

  var containerFileSystem = element.querySelector('.filesystemexplorer')
  var websocketconn = element.querySelector('.websocketconn')
  filesProvider['localhost'].remixd.event.register('connecting', (event) => {
    websocketconn.style.color = 'orange'
    websocketconn.setAttribute('title', 'Connecting to localhost. ' + JSON.stringify(event))
  })

  filesProvider['localhost'].remixd.event.register('connected', (event) => {
    websocketconn.style.color = 'green'
    websocketconn.setAttribute('title', 'Connected to localhost. ' + JSON.stringify(event))
  })

  filesProvider['localhost'].remixd.event.register('errored', (event) => {
    websocketconn.style.color = 'red'
    websocketconn.setAttribute('title', 'localhost connection errored. ' + JSON.stringify(event))
    if (fileSystemExplorer.element && containerFileSystem.children.length > 0) {
      containerFileSystem.removeChild(fileSystemExplorer.element)
    }
  })

  filesProvider['localhost'].remixd.event.register('closed', (event) => {
    websocketconn.style.color = '#111111'
    websocketconn.setAttribute('title', 'localhost connection closed. ' + JSON.stringify(event))
    if (fileSystemExplorer.element && containerFileSystem.children.length > 0) {
      containerFileSystem.removeChild(fileSystemExplorer.element)
    }
  })

  fileExplorer.events.register('focus', function (path) {
    appAPI.switchToFile(path)
  })

  fileSystemExplorer.events.register('focus', function (path) {
    appAPI.switchToFile(path)
  })

  self.render = function render () { return element }

  function uploadFile (event) {
    // TODO The file explorer is merely a view on the current state of
    // the files module. Please ask the user here if they want to overwrite
    // a file and then just use `files.add`. The file explorer will
    // pick that up via the 'fileAdded' event from the files module.
    ;[...this.files].forEach(fileExplorer.api.addFile)
  }

  // ----------------- resizeable ui ---------------
  function mousedown (event) {
    event.preventDefault()
    if (event.which === 1) {
      moveGhostbar(event)
      document.body.appendChild(ghostbar)
      document.addEventListener('mousemove', moveGhostbar)
      document.addEventListener('mouseup', removeGhostbar)
      document.addEventListener('keydown', cancelGhostbar)
    }
  }
  function cancelGhostbar (event) {
    if (event.keyCode === 27) {
      document.body.removeChild(ghostbar)
      document.removeEventListener('mousemove', moveGhostbar)
      document.removeEventListener('mouseup', removeGhostbar)
      document.removeEventListener('keydown', cancelGhostbar)
    }
  }
  function getPosition (event) {
    var rhp = document.body.offsetWidth - window['righthand-panel'].offsetWidth
    var newpos = (event.pageX < limit) ? limit : event.pageX
    newpos = (newpos < (rhp - limit)) ? newpos : (rhp - limit)
    return newpos
  }
  function moveGhostbar (event) {
    ghostbar.style.left = getPosition(event) + 'px'
  }
  function removeGhostbar (event) {
    document.body.removeChild(ghostbar)
    document.removeEventListener('mousemove', moveGhostbar)
    document.removeEventListener('mouseup', removeGhostbar)
    document.removeEventListener('keydown', cancelGhostbar)
    self.event.trigger('resize', [getPosition(event)])
  }

  function createNewFile () {
    var newName = filesProvider['browser'].type + '/' + appAPI.createName('Untitled.sol')
    if (!filesProvider['browser'].set(newName, '')) {
      alert('Failed to create file ' + newName)
    } else {
      appAPI.switchToFile(newName)
    }
  }

  /**
    * connect to localhost if no connection and render the explorer
    * disconnect from localhost if connected and remove the explorer
    *
    * @param {String} txHash    - hash of the transaction
    */
  function connectToLocalhost () {
    var container = document.querySelector('.filesystemexplorer')
    if (filesProvider['localhost'].files !== null) {
      filesProvider['localhost'].close((error) => {
        if (error) console.log(error)
      })
    } else {
      modalDialog('Connection to Localhost', remixdDialog(),
        { label: 'Connect',
          fn: () => {
            filesProvider['localhost'].init((error) => {
              if (error) {
                console.log(error)
              } else {
                if (fileSystemExplorer.element && container.children.length > 0) {
                  container.removeChild(fileSystemExplorer.element)
                }
                container.appendChild(fileSystemExplorer.init())
              }
            })
          }})
    }
  }
}
