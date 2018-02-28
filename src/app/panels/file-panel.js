/* global FileReader */
var async = require('async')
var $ = require('jquery')
var yo = require('yo-yo')
var minixhr = require('minixhr')  // simple and small cross-browser XMLHttpRequest (XHR)
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var FileExplorer = require('../files/file-explorer')
var modalDialog = require('../ui/modaldialog')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var QueryParams = require('../../lib/query-params')
var queryParams = new QueryParams()
var helper = require('../../lib/helper')

var styleGuide = remixLib.ui.themeChooser
var styles = styleGuide.chooser()

var css = require('./styles/file-panel-styles')

var limit = 60
var canUpload = window.File || window.FileReader || window.FileList || window.Blob
var ghostbar = yo`<div class=${css.ghostbar}></div>`

/*
  Overview of APIs:
   * fileManager: @args fileProviders (browser, shared-folder, swarm, github, etc ...) & config & editor
      - listen on browser & localhost file provider (`fileRenamed` & `fileRemoved`)
      - update the tabs, switchFile
      - trigger `currentFileChanged`
      - set the current file in the config
   * fileProvider: currently browser, swarm, localhost, github, gist
      - link to backend
      - provide properties `type`, `readonly`
      - provide API `resolveDirectory`, `remove`, `exists`, `rename`, `get`, `set`
      - trigger `fileExternallyChanged`, `fileRemoved`, `fileRenamed`, `fileRenamedError`, `fileAdded`
   * file-explorer: treeview @args fileProvider
      - listen on events triggered by fileProvider
      - call fileProvider API
*/

function filepanel (appAPI, filesProvider) {
  var self = this
  var fileExplorer = new FileExplorer(appAPI, filesProvider['browser'])
  var fileSystemExplorer = new FileExplorer(appAPI, filesProvider['localhost'])
  var swarmExplorer = new FileExplorer(appAPI, filesProvider['swarm'])
  var githubExplorer = new FileExplorer(appAPI, filesProvider['github'])
  var gistExplorer = new FileExplorer(appAPI, filesProvider['gist'])
  var configExplorer = new FileExplorer(appAPI, filesProvider['config'])

  var dragbar = yo`<div onmousedown=${mousedown} class=${css.dragbar}></div>`

  function remixdDialog () {
    return yo`
      <div class=${css.dialog}>
        <div class=${css.dialogParagraph}>Interact with your file system from Remix. Click connect and find shared folder in the Remix file explorer (under localhost).
          Before you get started, check out <a target="_blank" href="https://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html">Tutorial_remixd_filesystem</a>
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
            <span class="${css.copyFiles}" title="Copy all files to another instance of Remix IDE" onclick=${copyFiles}>
              <i class="fa fa-files-o" aria-hidden="true"></i>
            </span>
            <span onclick=${connectToLocalhost} class="${css.connectToLocalhost}">
              <i class="websocketconn fa fa-link" title="Connect to Localhost"></i>
            </span>
          </div>
          <div class=${css.treeviews}>
            <div class=${css.treeview}>${fileExplorer.init()}</div>
            <div class="configexplorer ${css.treeview}">${configExplorer.init()}</div>
            <div class="filesystemexplorer ${css.treeview}">${fileSystemExplorer.init()}</div>
            <div class="swarmexplorer ${css.treeview}">${swarmExplorer.init()}</div>
            <div class="githubexplorer ${css.treeview}">${githubExplorer.init()}</div>
            <div class="gistexplorer ${css.treeview}">${gistExplorer.init()}</div>
          </div>
        </div>
        ${dragbar}
      </div>
    `
  }

  var event = new EventManager()
  self.event = event
  var element = template()
  fileExplorer.ensureRoot()
  configExplorer.ensureRoot()
  var websocketconn = element.querySelector('.websocketconn')
  filesProvider['localhost'].remixd.event.register('connecting', (event) => {
    websocketconn.style.color = styles.colors.yellow
    websocketconn.setAttribute('title', 'Connecting to localhost. ' + JSON.stringify(event))
  })

  filesProvider['localhost'].remixd.event.register('connected', (event) => {
    websocketconn.style.color = styles.colors.green
    websocketconn.setAttribute('title', 'Connected to localhost. ' + JSON.stringify(event))
    fileSystemExplorer.show()
  })

  filesProvider['localhost'].remixd.event.register('errored', (event) => {
    websocketconn.style.color = styles.colors.red
    websocketconn.setAttribute('title', 'localhost connection errored. ' + JSON.stringify(event))
    fileSystemExplorer.hide()
  })

  filesProvider['localhost'].remixd.event.register('closed', (event) => {
    websocketconn.style.color = styles.colors.black
    websocketconn.setAttribute('title', 'localhost connection closed. ' + JSON.stringify(event))
    fileSystemExplorer.hide()
  })

  fileExplorer.events.register('focus', function (path) {
    appAPI.switchFile(path)
  })

  configExplorer.events.register('focus', function (path) {
    appAPI.switchFile(path)
  })

  fileSystemExplorer.events.register('focus', function (path) {
    appAPI.switchFile(path)
  })

  swarmExplorer.events.register('focus', function (path) {
    appAPI.switchFile(path)
  })

  githubExplorer.events.register('focus', function (path) {
    appAPI.switchFile(path)
  })

  gistExplorer.events.register('focus', function (path) {
    appAPI.switchFile(path)
  })

  self.render = function render () { return element }

  function uploadFile (event) {
    // TODO The file explorer is merely a view on the current state of
    // the files module. Please ask the user here if they want to overwrite
    // a file and then just use `files.add`. The file explorer will
    // pick that up via the 'fileAdded' event from the files module.

    ;[...this.files].forEach((file) => {
      var files = fileExplorer.files
      function loadFile () {
        var fileReader = new FileReader()
        fileReader.onload = function (event) {
          if (helper.checkSpecialChars(file.name)) {
            modalDialogCustom.alert('Special characters are not allowed')
            return
          }
          var success = files.set(name, event.target.result)
          if (!success) modalDialogCustom.alert('Failed to create file ' + name)
          else self.event.trigger('focus', [name])
        }
        fileReader.readAsText(file)
      }

      var name = files.type + '/' + file.name
      files.exists(name, (error, exist) => {
        if (error) console.log(error)
        if (!exist) {
          loadFile()
        } else {
          modalDialogCustom.confirm(null, `The file ${name} already exists! Would you like to overwrite it?`, () => { loadFile() })
        }
      })
    })
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
    modalDialogCustom.prompt(null, 'File Name', 'Untitled.sol', (input) => {
      helper.createNonClashingName(input, filesProvider['browser'], (error, newName) => {
        if (error) return modalDialogCustom.alert('Failed to create file ' + newName + ' ' + error)
        if (!filesProvider['browser'].set(newName, '')) {
          modalDialogCustom.alert('Failed to create file ' + newName)
        } else {
          appAPI.switchFile(filesProvider['browser'].type + '/' + newName)
        }
      })
    })
  }

  /**
    * connect to localhost if no connection and render the explorer
    * disconnect from localhost if connected and remove the explorer
    *
    * @param {String} txHash    - hash of the transaction
    */
  function connectToLocalhost () {
    if (filesProvider['localhost'].isConnected()) {
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
                fileSystemExplorer.ensureRoot()
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
        } else {
          modalDialogCustom.alert(data.message + ' ' + data.documentation_url)
        }
      }
    }

    function toGist () {
      packageFiles(filesProvider['browser'], (error, packaged) => {
        if (error) {
          console.log(error)
          modalDialogCustom.alert('Failed to create gist: ' + error)
        } else {
          var description = 'Created using remix-ide: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://ethereum.github.io/remix-ide/#version=' + queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&gist='
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
    modalDialogCustom.prompt(null, 'To which other remix-ide instance do you want to copy over all files?', 'https://ethereum.github.io/remix-ide/', (target) => {
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
function packageFiles (filesProvider, callback) {
  var ret = {}
  filesProvider.resolveDirectory('browser', (error, files) => {
    if (error) callback(error)
    else {
      async.eachSeries(Object.keys(files), (path, cb) => {
        filesProvider.get(path, (error, content) => {
          if (error) cb(error)
          else {
            ret[path] = { content }
            cb()
          }
        })
      }, (error) => {
        callback(error, ret)
      })
    }
  })
}

module.exports = filepanel
