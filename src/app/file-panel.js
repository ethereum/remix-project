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
    box-sizing        : border-box;
  }
  .fileexplorer       {
    display           : flex;
    flex-direction    : column;
    position          : relative;
    top               : -33px;
    width             : 100%;
  }
  .menu               {
    display           : flex;
    flex-direction    : row;
  }
  .newFile            {
    padding           : 10px;
  }
  .connectToLocalhost {
    padding           : 10px;
  }
  .uploadFile         {
    padding           : 10px;
  }
  .toggleLHP          {
    display           : flex;
    justify-content   : flex-end;
    padding           : 10px;
    width             : 100%;
    font-weight       : bold;
    cursor            : pointer;
    color             : black;
  }
  .isVisible          {
    position          : absolute;
    left              : 35px;
  }
  .isHidden {
    position          : absolute;
    height            : 99%;
    left              : -101%;
  }
  .treeview {
    background-color  : white;
  }
  .dragbar            {
    position          : relative;
    top               : 4px;
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
  .changeeditorfontsize {
    padding: 10px;
  }
  .changeeditorfontsize i {
    display: block;
    color: #111111;
  }
`

var limit = 60
var canUpload = window.File || window.FileReader || window.FileList || window.Blob
var ghostbar = yo`<div class=${css.ghostbar}></div>`

function filepanel (appAPI, filesProvider) {
  var fileExplorer = new FileExplorer(appAPI, filesProvider['browser'])
  var fileSystemExplorer = new FileExplorer(appAPI, filesProvider['localhost'])
  var dragbar = yo`<div onmousedown=${mousedown} class=${css.dragbar}></div>`

  function remixdDialog () {
    return yo`<div><div>This feature allows to interact with your file system from Remix. Once the connection is made the shared folder will be available in the file explorer under <i>localhost</i></div>
              <div><i>Remixd</i> first has to be run in your local computer. See <a href="http://remix.readthedocs.io/en/latest/tutorial_mist.html">http://remix.readthedocs.io/en/latest/remixd.html</a> for more details.</div>
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
            <span class=${css.changeeditorfontsize} >
              <i class="increditorsize fa fa-plus" aria-hidden="true" title="increase editor font size"></i>
              <i class="decreditorsize fa fa-minus" aria-hidden="true" title="decrease editor font size"></i>
            </span>
            <span class=${css.toggleLHP} onclick=${toggle} title="Toggle left hand panel">
              <i class="fa fa-angle-double-left"></i>
            </span>
          </div>
          <div class=${css.treeview}>${fileExplorer.init()}</div>
          <div class="filesystemexplorer ${css.treeview}"></div>
        </div>
        ${dragbar}
      </div>
    `
  }

  var events = new EventManager()
  var element = template()
  element.querySelector('.increditorsize').addEventListener('click', () => { appAPI.editorFontSize(1) })
  element.querySelector('.decreditorsize').addEventListener('click', () => { appAPI.editorFontSize(-1) })
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
  // TODO please do not add custom javascript objects, which have no
  // relation to the DOM to DOM nodes
  element.events = events
  fileExplorer.events.register('focus', function (path) {
    appAPI.switchToFile(path)
  })

  fileSystemExplorer.events.register('focus', function (path) {
    appAPI.switchToFile(path)
  })

  return element

  function toggle (event) {
    var isHidden = element.classList.toggle(css.isHidden)
    this.classList.toggle(css.isVisible)
    this.children[0].classList.toggle('fa-angle-double-right')
    this.children[0].classList.toggle('fa-angle-double-left')
    events.trigger('ui-hidden', [isHidden])
  }

  function uploadFile (event) {
    // TODO The file explorer is merely a view on the current state of
    // the files module. Please ask the user here if they want to overwrite
    // a file and then just use `files.add`. The file explorer will
    // pick that up via the 'fileAdded' event from the files module.
    ;[...this.files].forEach(fileExplorer.api.addFile)
  }

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
  function moveGhostbar (event) {
    var rhp = window['righthand-panel'].offsetLeft
    var newpos = (event.pageX < limit) ? limit : event.pageX
    newpos = (newpos < (rhp - limit)) ? newpos : (rhp - limit)
    ghostbar.style.left = newpos + 'px'
  }

  function removeGhostbar (event) {
    document.body.removeChild(ghostbar)
    document.removeEventListener('mousemove', moveGhostbar)
    document.removeEventListener('mouseup', removeGhostbar)
    document.removeEventListener('keydown', cancelGhostbar)
    var width = (event.pageX < limit) ? limit : event.pageX
    element.style.width = width + 'px'
    events.trigger('ui-resize', [width])
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
      modalDialog('Connection to Localhost', remixdDialog(), () => {
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
      })
    }
  }
}
