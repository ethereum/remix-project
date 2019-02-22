/* global FileReader */
var async = require('async')
var $ = require('jquery')
var yo = require('yo-yo')
var CompilerMetadata = require('../files/compiler-metadata')
var EventManager = require('../../lib/events')
var Gists = require('gists')
var FileExplorer = require('../files/file-explorer')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var tooltip = require('../ui/tooltip')
var QueryParams = require('../../lib/query-params')
var queryParams = new QueryParams()
var helper = require('../../lib/helper')
var { RemixdHandle } = require('../files/remixd-handle.js')

var globalRegistry = require('../../global/registry')

var css = require('./styles/file-panel-styles')

var canUpload = window.File || window.FileReader || window.FileList || window.Blob

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

function filepanel (localRegistry) {
  var self = this
  self._components = {}
  self._components.registry = localRegistry || globalRegistry
  self._deps = {
    fileProviders: self._components.registry.get('fileproviders').api,
    fileManager: self._components.registry.get('filemanager').api,
    config: self._components.registry.get('config').api,
    pluginManager: self._components.registry.get('pluginmanager').api
  }
  var fileExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['browser'])
  var fileSystemExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['localhost'])
  var swarmExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['swarm'])
  var githubExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['github'])
  var gistExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['gist'])
  var configExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['config'])
  var httpExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['http'])
  var httpsExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['https'])

  self.remixdHandle = new RemixdHandle(fileSystemExplorer, self._deps.fileProviders['localhost'])

  // ----------------- editor panel ----------------------
  self._compilerMetadata = new CompilerMetadata(
    {
      fileManager: self._deps.fileManager,
      pluginManager: self._deps.pluginManager,
      config: self._deps.config
    }
  )
  self._compilerMetadata.syncContractMetadata()

  self.compilerMetadata = () => { return self._compilerMetadata }

  function template () {
    return yo`
      <div class=${css.container}>
        <div class="${css.fileexplorer}">
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
            <span class="${css.gist}" title="Publish all [browser] explorer files to a github gist" onclick=${() => publishToGist('browser')}>
              <i class="fa fa-github"></i>
            </span>
            <span class="${css.gist}" title="Update the current [gist] explorer" onclick=${() => updateGist()}>
              <i class="fa fa-github"></i>
            </span>
            <span class="${css.copyFiles}" title="Copy all files to another instance of Remix IDE" onclick=${copyFiles}>
              <i class="fa fa-files-o" aria-hidden="true"></i>
            </span>
          </div>
          <div>
            <div class=${css.treeview}>${fileExplorer.init()}</div>
            <div class="configexplorer ${css.treeview}">${configExplorer.init()}</div>
            <div class="filesystemexplorer ${css.treeview}">${fileSystemExplorer.init()}</div>
            <div class="swarmexplorer ${css.treeview}">${swarmExplorer.init()}</div>
            <div class="githubexplorer ${css.treeview}">${githubExplorer.init()}</div>
            <div class="gistexplorer ${css.treeview}">${gistExplorer.init()}</div>
            <div class="httpexplorer ${css.treeview}">${httpExplorer.init()}</div>
            <div class="httpsexplorer ${css.treeview}">${httpsExplorer.init()}</div>
          </div>
        </div>
      </div>
    `
  }

  var event = new EventManager()
  self.event = event
  var element = template()
  fileExplorer.ensureRoot()
  configExplorer.ensureRoot()
  self._deps.fileProviders['localhost'].event.register('connecting', (event) => {
    tooltip('Connecting to localhost. ' + JSON.stringify(event))
  })

  self._deps.fileProviders['localhost'].event.register('connected', (event) => {
    tooltip('Connected to localhost. ' + JSON.stringify(event))
    fileSystemExplorer.show()
  })

  self._deps.fileProviders['localhost'].event.register('errored', (event) => {
    tooltip('localhost connection errored. ' + JSON.stringify(event))
    fileSystemExplorer.hide()
  })

  self._deps.fileProviders['localhost'].event.register('closed', (event) => {
    tooltip('localhost connection closed. ' + JSON.stringify(event))
    fileSystemExplorer.hide()
  })

  fileExplorer.events.register('focus', function (path) {
    self._deps.fileManager.switchFile(path)
  })

  configExplorer.events.register('focus', function (path) {
    self._deps.fileManager.switchFile(path)
  })

  fileSystemExplorer.events.register('focus', function (path) {
    self._deps.fileManager.switchFile(path)
  })

  swarmExplorer.events.register('focus', function (path) {
    self._deps.fileManager.switchFile(path)
  })

  githubExplorer.events.register('focus', function (path) {
    self._deps.fileManager.switchFile(path)
  })

  gistExplorer.events.register('focus', function (path) {
    self._deps.fileManager.switchFile(path)
  })

  httpExplorer.events.register('focus', function (path) {
    self._deps.fileManager.switchFile(path)
  })

  httpsExplorer.events.register('focus', function (path) {
    self._deps.fileManager.switchFile(path)
  })

  self.render = function render () { return element }

  self.profile = function () {
    return {
      name: 'fileExplorers',
      displayName: 'file explorers',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjk2IDM4NHE0MCAwIDY4IDI4dDI4IDY4djEyMTZxMCA0MC0yOCA2OHQtNjggMjhoLTk2MHEtNDAgMC02OC0yOHQtMjgtNjh2LTI4OGgtNTQ0cS00MCAwLTY4LTI4dC0yOC02OHYtNjcycTAtNDAgMjAtODh0NDgtNzZsNDA4LTQwOHEyOC0yOCA3Ni00OHQ4OC0yMGg0MTZxNDAgMCA2OCAyOHQyOCA2OHYzMjhxNjgtNDAgMTI4LTQwaDQxNnptLTU0NCAyMTNsLTI5OSAyOTloMjk5di0yOTl6bS02NDAtMzg0bC0yOTkgMjk5aDI5OXYtMjk5em0xOTYgNjQ3bDMxNi0zMTZ2LTQxNmgtMzg0djQxNnEwIDQwLTI4IDY4dC02OCAyOGgtNDE2djY0MGg1MTJ2LTI1NnEwLTQwIDIwLTg4dDQ4LTc2em05NTYgODA0di0xMTUyaC0zODR2NDE2cTAgNDAtMjggNjh0LTY4IDI4aC00MTZ2NjQwaDg5NnoiLz48L3N2Zz4=',
      description: ' - ',
      kind: 'fileexplorer'
    }
  }

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

  function createNewFile () {
    modalDialogCustom.prompt(null, 'File Name', 'Untitled.sol', (input) => {
      helper.createNonClashingName(input, self._deps.fileProviders['browser'], (error, newName) => {
        if (error) return modalDialogCustom.alert('Failed to create file ' + newName + ' ' + error)
        if (!self._deps.fileProviders['browser'].set(newName, '')) {
          modalDialogCustom.alert('Failed to create file ' + newName)
        } else {
          var file = self._deps.fileProviders['browser'].type + '/' + newName
          self._deps.fileManager.switchFile(file)
          if (file.includes('_test.sol')) {
            self.event.trigger('newTestFileCreated', [file])
          }
        }
      })
    }, null, true)
  }

  // ------------------ gist publish --------------

  function updateGist () {
    var gistId = self._deps.fileProviders['gist'].id
    if (!gistId) {
      tooltip('no gist content is currently loaded.')
    } else {
      toGist('gist', gistId)
    }
  }

  function publishToGist (fileProviderName) {
    modalDialogCustom.confirm(null, 'Are you very sure you want to publish all your files anonymously as a public gist on github.com?', () => {
      toGist(fileProviderName)
    })
  }

  function toGist (fileProviderName, id) {
    packageFiles(self._deps.fileProviders[fileProviderName], (error, packaged) => {
      if (error) {
        console.log(error)
        modalDialogCustom.alert('Failed to create gist: ' + error)
      } else {
        var tokenAccess = self._deps.config.get('settings/gist-access-token')
        if (!tokenAccess) {
          modalDialogCustom.alert('Remix requires an access token (which includes gists creation permission). Please go to the settings tab for more information.')
        } else {
          var description = 'Created using remix-ide: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://remix.ethereum.org/#version=' + queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&gist='
          var gists = new Gists({
            token: tokenAccess
          })
          if (id) {
            tooltip('Saving gist (' + id + ') ...')
            gists.edit({
              description: description,
              public: true,
              files: packaged,
              id: id
            }, (error, result) => {
              cb(error, result)
            })
          } else {
            tooltip('Creating a new gist ...')
            gists.create({
              description: description,
              public: true,
              files: packaged
            }, (error, result) => {
              cb(error, result)
            })
          }
        }
      }
    })
  }

  function cb (error, data) {
    if (error) {
      modalDialogCustom.alert('Failed to manage gist: ' + error)
    } else {
      if (data.html_url) {
        modalDialogCustom.confirm(null, `The gist is at ${data.html_url}. Would you like to open it in a new window?`, () => {
          window.open(data.html_url, '_blank')
        })
      } else {
        modalDialogCustom.alert(data.message + ' ' + data.documentation_url + ' ' + JSON.stringify(data.errors, null, '\t'))
      }
    }
  }

  // ------------------ copy files --------------

  function copyFiles () {
    modalDialogCustom.prompt(null, 'To which other remix-ide instance do you want to copy over all files?', 'https://remix.ethereum.org', (target) => {
      doCopy(target)
    })
    function doCopy (target) {
      // package only files from the browser storage.
      packageFiles(self._deps.fileProviders['browser'], (error, packaged) => {
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
  filesProvider.resolveDirectory(filesProvider.type, (error, files) => {
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
