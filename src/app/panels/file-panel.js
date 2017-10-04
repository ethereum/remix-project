var async = require('async')
var $ = require('jquery')
var csjs = require('csjs-inject')
var yo = require('yo-yo')
var minixhr = require('minixhr')  // simple and small cross-browser XMLHttpRequest (XHR)
var EventManager = require('ethereum-remix').lib.EventManager
var FileExplorer = require('../files/file-explorer')
var modalDialog = require('../ui/modaldialog')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var QueryParams = require('../../lib/query-params')
var queryParams = new QueryParams()
var helper = require('../../lib/helper')

var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

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
    height            : 2em;
    margin-top        : 0.5em;
    flex-shrink       : 0;
  }
  .newFile            {
    padding           : 10px;
  }
  .newFile i          {
    cursor            : pointer;
  }
  .newFile i:hover    {
    color             : ${styles.colors.orange};
  }
  .gist            {
    padding           : 10px;
  }
  .gist i          {
    cursor            : pointer;
  }
  .gist i:hover    {
    color             : orange;
  }
  .copyFiles            {
    padding           : 10px;
  }
  .copyFiles i          {
    cursor            : pointer;
  }
  .copyFiles i:hover    {
    color             : orange;
  }
  .connectToLocalhost {
    padding           : 10px;
  }
  .connectToLocalhost i {
    cursor            : pointer;
  }
  .connectToLocalhost i:hover   {
    color             : ${styles.colors.orange};
  }
  .uploadFile         {
    padding           : 10px;
  }
  .uploadFile label:hover   {
    color             : ${styles.colors.orange};
  }
  .uploadFile label   {
    cursor            : pointer;
  }
  .treeview {
    background-color  : ${styles.colors.general_BackgroundColor};
  }
  .treeviews {
    overflow-y        : auto;
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
    background-color  : ${styles.colors.lightBlue};
    opacity           : 0.5;
    position          : absolute;
    cursor            : col-resize;
    z-index           : 9999;
    top               : 0;
    bottom            : 0;
  }
  .dialog {
    display: flex;
    flex-direction: column;
  }
  .dialogParagraph {
    ${styles.infoTextBox}
    margin-bottom: 2em;
    word-break: break-word;
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
    return yo`
      <div class=${css.dialog}>
        <div class=${css.dialogParagraph}>Interact with your file system from Remix. Click connect and find shared folder in the Remix file explorer (under localhost).
          Before you get started, check out <a target="_blank" href="http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html">Tutorial_remixd_filesystem</a>
          to find out how to run Remixd.
        </div>
        <div class=${css.dialogParagraph}>Connection will start a session between <em>${window.location.href}</em> and your local file system <i>ws://127.0.0.1:65520</i>
          so please make sure your system is secured enough (port 65520 neither opened nor forwarded).
          <i class="fa fa-link"></i> will show you current connection status.
        </div>
        <div class=${css.dialogParagraph}>This feature is still in Alpha, so we recommend you to keep a copy of the shared folder.</div>
      </div>
    `
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
            <span class="${css.gist}" title="Publish all open files to an anonymous github gist" onclick=${() => publishToGist(appAPI)}>
              <i class="fa fa-github"></i>
            </span>
            <span class="${css.copyFiles}" title="Copy all files to another instance of Browser-solidity" onclick=${copyFiles}>
              <i class="fa fa-files-o" aria-hidden="true"></i>
            </span>
            <span onclick=${connectToLocalhost} class="${css.connectToLocalhost}">
              <i class="websocketconn fa fa-link" title="Connect to Localhost"></i>
            </span>
          </div>
          <div class=${css.treeviews}>
            <div class=${css.treeview}>${fileExplorer.init()}</div>
            <div class="filesystemexplorer ${css.treeview}"></div>
          </div>
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
    websocketconn.style.color = styles.colors.yellow
    websocketconn.setAttribute('title', 'Connecting to localhost. ' + JSON.stringify(event))
  })

  filesProvider['localhost'].remixd.event.register('connected', (event) => {
    websocketconn.style.color = styles.colors.green
    websocketconn.setAttribute('title', 'Connected to localhost. ' + JSON.stringify(event))
  })

  filesProvider['localhost'].remixd.event.register('errored', (event) => {
    websocketconn.style.color = styles.colors.red
    websocketconn.setAttribute('title', 'localhost connection errored. ' + JSON.stringify(event))
    if (fileSystemExplorer.element && containerFileSystem.children.length > 0) {
      containerFileSystem.removeChild(fileSystemExplorer.element)
    }
  })

  filesProvider['localhost'].remixd.event.register('closed', (event) => {
    websocketconn.style.color = styles.colors.black
    websocketconn.setAttribute('title', 'localhost connection closed. ' + JSON.stringify(event))
    if (fileSystemExplorer.element && containerFileSystem.children.length > 0) {
      containerFileSystem.removeChild(fileSystemExplorer.element)
    }
  })

  fileExplorer.events.register('focus', function (path) {
    appAPI.switchFile(path)
  })

  fileSystemExplorer.events.register('focus', function (path) {
    appAPI.switchFile(path)
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
  function moveGhostbar (event) { // @NOTE VERTICAL ghostbar
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
    var newName = filesProvider['browser'].type + '/' + helper.createNonClashingName('Untitled.sol', filesProvider['browser'])
    if (!filesProvider['browser'].set(newName, '')) {
      modalDialogCustom.alert('Failed to create file ' + newName)
    } else {
      appAPI.switchFile(newName)
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
      modalDialog('Connect to localhost', remixdDialog(),
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

  // ------------------ gist publish --------------

  function publishToGist () {
    function cb (data) {
      if (data instanceof Error) {
        console.log('fail', data.message)
        modalDialogCustom.alert('Failed to create gist: ' + (data || 'Unknown transport error'))
      } else {
        data = JSON.parse(data)
        if (data.html_url) {
          modalDialogCustom.confirm(null, `Created a gist at ${data.html_url}. Would you like to open it in a new window?`, () => {
            window.open(data.html_url, '_blank')
          })
        }
      }
    }

    function toGist () {
      packageFiles(filesProvider['browser'], (error, packaged) => {
        if (error) {
          console.log(error)
        } else {
          var description = 'Created using browser-solidity: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://ethereum.github.io/browser-solidity/#version=' + queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&gist='
          console.log(packaged)
          minixhr({
            url: 'https://api.github.com/gists',
            method: 'POST',
            data: JSON.stringify({
              description: description,
              public: true,
              files: packaged
            })
          }, cb)
        }
      })
    }
    modalDialogCustom.confirm(null, 'Are you very sure you want to publish all your files anonymously as a public gist on github.com?', () => {
      toGist()
    })
  }

  // ------------------ copy files --------------

  function copyFiles () {
    modalDialogCustom.prompt(null, 'To which other browser-solidity instance do you want to copy over all files?', 'https://ethereum.github.io/browser-solidity/', (target) => {
      doCopy(target)
    })
    function doCopy (target) {
      // package only files from the browser storage.
      packageFiles(filesProvider['browser'], (error, packaged) => {
        if (error) {
          console.log(error)
        } else {
          $('<iframe/>', {
            src: target,
            style: 'display:none;',
            load: function () { this.contentWindow.postMessage(['loadFiles', packaged], '*') }
          }).appendTo('body')
        }
      })
    }
  }
}

// return all the files, except the temporary/readonly ones..
function packageFiles (files, callback) {
  var ret = {}
  var filtered = Object.keys(files.list()).filter(function (path) { if (!files.isReadOnly(path)) { return path } })
  async.eachSeries(filtered, function (path, cb) {
    ret[path.replace(files.type + '/', '')] = { content: files.get(path) }
    cb()
  }, () => {
    callback(null, ret)
  })
}
