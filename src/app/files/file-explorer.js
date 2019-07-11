/* global FileReader */
var async = require('async')
var Gists = require('gists')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var tooltip = require('../ui/tooltip')
var QueryParams = require('../../lib/query-params')
var helper = require('../../lib/helper')
var yo = require('yo-yo')
var Treeview = require('../ui/TreeView')
var modalDialog = require('../ui/modaldialog')
var EventManager = require('../../lib/events')
var contextMenu = require('../ui/contextMenu')
var css = require('./styles/file-explorer-styles')
var globalRegistry = require('../../global/registry')
var queryParams = new QueryParams()
let MENU_HANDLE

function fileExplorer (localRegistry, files, menuItems) {
  var self = this
  this.events = new EventManager()
  // file provider backend
  this.files = files
  // element currently focused on
  this.focusElement = null
  // path currently focused on
  this.focusPath = null
  let allItems =
    [
      { action: 'createNewFile',
        title: 'Create New File in the Browser Storage Explorer',
        icon: 'fas fa-plus-circle'
      },
      { action: 'publishToGist',
        title: 'Publish all [browser] explorer files to a github gist',
        icon: 'fab fa-github'
      },
      { action: 'copyFiles',
        title: 'Copy all files to another instance of Remix IDE',
        icon: 'far fa-copy'
      },
      { action: 'uploadFile',
        title: 'Add Local file to the Browser Storage Explorer',
        icon: 'far fa-folder-open'
      },
      { action: 'updateGist',
        title: 'Update the current [gist] explorer',
        icon: 'fab fa-github'
      }
    ]
  // menu items
  this.menuItems = allItems.filter(
    (item) => {
      if (menuItems) return menuItems.find((name) => { return name === item.action })
    }
  )

  self._components = {}
  self._components.registry = localRegistry || globalRegistry
  self._deps = {
    config: self._components.registry.get('config').api,
    editor: self._components.registry.get('editor').api,
    fileManager: self._components.registry.get('filemanager').api
  }

  self._components.registry.put({ api: self, name: `fileexplorer/${self.files.type}` })

  // warn if file changed outside of Remix
  function remixdDialog () {
    return yo`<div>This file has been changed outside of Remix IDE.</div>`
  }

  this.files.event.register('fileExternallyChanged', (path, file) => {
    if (self._deps.config.get('currentFile') === path && self._deps.editor.currentContent() && self._deps.editor.currentContent() !== file.content) {
      if (this.files.isReadOnly(path)) return self._deps.editor.setText(file.content)

      modalDialog(path + ' changed', remixdDialog(),
        {
          label: 'Replace by the new content',
          fn: () => {
            self._deps.editor.setText(file.content)
          }
        },
        {
          label: 'Keep the content displayed in Remix',
          fn: () => {}
        }
      )
    }
  })

  // register to event of the file provider
  files.event.register('fileRemoved', fileRemoved)
  files.event.register('fileRenamed', fileRenamed)
  files.event.register('fileRenamedError', fileRenamedError)
  files.event.register('fileAdded', fileAdded)

  function fileRenamedError (error) {
    modalDialogCustom.alert(error)
  }

  function fileAdded (filepath) {
    self.ensureRoot(() => {
      var folderpath = filepath.split('/').slice(0, -1).join('/')

      var currentTree = self.treeView.nodeAt(folderpath)
      if (currentTree && self.treeView.isExpanded(folderpath)) {
        self.files.resolveDirectory(folderpath, (error, fileTree) => {
          if (error) console.error(error)
          if (!fileTree) return
          fileTree = normalize(folderpath, fileTree)
          self.treeView.updateNodeFromJSON(folderpath, fileTree, true)
          self.focusElement = self.treeView.labelAt(self.focusPath)
          // TODO: here we update the selected file (it applicable)
          // cause we are refreshing the interface of the whole directory when there's a new file.
          if (self.focusElement && !self.focusElement.classList.contains('bg-secondary')) {
            self.focusElement.classList.add('bg-secondary')
          }
        })
      }
    })
  }

  function fileRemoved (filepath) {
    var label = self.treeView.labelAt(filepath)
    if (label && label.parentElement) {
      label.parentElement.removeChild(label)
    }
  }

  function fileRenamed (oldName, newName, isFolder) {
    fileRemoved(oldName)
    fileAdded(newName)
  }

  // make interface and register to nodeClick, leafClick
  self.treeView = new Treeview({
    extractData: function extractData (value, tree, key) {
      var newValue = {}
      // var isReadOnly = false
      var isFile = false
      Object.keys(value).filter(function keep (x) {
        if (x === '/content') isFile = true
        // if (x === '/readOnly') isReadOnly = true
        if (x[0] !== '/') return true
      }).forEach(function (x) { newValue[x] = value[x] })
      return {
        path: (tree || {}).path ? tree.path + '/' + key : key,
        children: isFile ? undefined
          : value instanceof Array ? value.map((item, index) => ({
            key: index, value: item
          })) : value instanceof Object ? Object.keys(value).map(subkey => ({
            key: subkey, value: value[subkey]
          })) : undefined
      }
    },
    formatSelf: function formatSelf (key, data, li) {
      var isRoot = data.path === self.files.type
      return yo`
        <div class="${css.items}">
          <span
            title="${data.path}"
            class="${css.label} ${!isRoot ? css.leaf : ''}"
            data-path="${data.path}"
            style="${isRoot ? 'font-weight:bold;' : ''}"
            onkeydown=${editModeOff}
            onblur=${editModeOff}
          >
            ${key.split('/').pop()}
          </span>
          ${isRoot ? self.renderMenuItems() : ''}
        </div>
      `
    }
  })

  self.treeView.event.register('nodeRightClick', function (key, data, label, event) {
    if (self.files.readonly) return
    if (key === self.files.type) return
    MENU_HANDLE && MENU_HANDLE.hide(null, true)
    MENU_HANDLE = contextMenu(event, {
      'Rename': () => {
        if (self.files.readonly) { return tooltip('cannot rename folder. ' + self.files.type + ' is a read only explorer') }
        var name = label.querySelector('span[data-path="' + key + '"]')
        if (name) editModeOn(name)
      },
      'Delete': () => {
        if (self.files.readonly) { return tooltip('cannot delete folder. ' + self.files.type + ' is a read only explorer') }
        modalDialogCustom.confirm('Confirm to delete a folder', 'Are you sure you want to delete this folder?', () => { files.remove(key) }, () => {})
      }
    })
  })

  self.treeView.event.register('leafRightClick', function (key, data, label, event) {
    if (key === self.files.type) return
    MENU_HANDLE && MENU_HANDLE.hide(null, true)
    let actions = {}
    if (!self.files.readonly) {
      actions['Rename'] = () => {
        if (self.files.readonly) { return tooltip('cannot rename file. ' + self.files.type + ' is a read only explorer') }
        var name = label.querySelector('span[data-path="' + key + '"]')
        if (name) editModeOn(name)
      }
      actions['Delete'] = () => {
        if (self.files.readonly) { return tooltip('cannot delete file. ' + self.files.type + ' is a read only explorer') }
        modalDialogCustom.confirm('Delete a file', 'Are you sure you want to delete this file?', () => { files.remove(key) }, () => {})
      }
    }
    if (self.files.type !== 'browser') {
      actions['Copy to Browser explorer'] = () => {
        files.get(key, (error, content) => {
          if (error) return tooltip(error)
          self._deps.fileManager.setFile(`browser/${label.innerText}`, content)
        })
      }
    }
    MENU_HANDLE = contextMenu(event, actions)
  })

  self.treeView.event.register('leafClick', function (key, data, label) {
    self.events.trigger('focus', [key])
  })

  self.treeView.event.register('nodeClick', function (path, childrenContainer) {
    if (!childrenContainer) return
    if (childrenContainer.style.display === 'none') return
    self.updatePath(path)
  })

  // register to main app, trigger when the current file in the editor changed
  self._deps.fileManager.events.on('currentFileChanged', (newFile) => {
    const explorer = self._deps.fileManager.fileProviderOf(newFile)
    if (self.focusElement && self.focusPath !== newFile) {
      self.focusElement.classList.remove('bg-secondary')
      self.focusElement = null
      self.focusPath = null
    }
    if (explorer && (explorer.type === files.type)) {
      self.focusElement = self.treeView.labelAt(newFile)
      if (self.focusElement) {
        self.focusElement.classList.add('bg-secondary')
        self.focusPath = newFile
      }
    }
  })

  self._deps.fileManager.events.on('noFileSelected', () => {
    if (self.focusElement) {
      self.focusElement.classList.remove('bg-secondary')
      self.focusElement = null
      self.focusPath = null
    }
  })

  var textUnderEdit = null

  function selectElementContents (el) {
    var range = document.createRange()
    range.selectNodeContents(el)
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  function editModeOn (label) {
    textUnderEdit = label.innerText
    label.setAttribute('contenteditable', true)
    label.classList.add('bg-light')
    label.focus()
    selectElementContents(label)
  }

  function editModeOff (event) {
    var label = this
    function rename () {
      var newPath = label.dataset.path
      newPath = newPath.split('/')
      newPath[newPath.length - 1] = label.innerText
      newPath = newPath.join('/')
      if (label.innerText === '') {
        modalDialogCustom.alert('File name cannot be empty')
        label.innerText = textUnderEdit
      } else if (helper.checkSpecialChars(label.innerText)) {
        modalDialogCustom.alert('Special characters are not allowed')
        label.innerText = textUnderEdit
      } else {
        files.exists(newPath, (error, exist) => {
          if (error) return modalDialogCustom.alert('Unexpected error while renaming: ' + error)
          if (!exist) {
            files.rename(label.dataset.path, newPath, isFolder)
          } else {
            modalDialogCustom.alert('File already exists.')
            label.innerText = textUnderEdit
          }
        })
      }
    }

    if (event.which === 13) event.preventDefault()
    if ((event.type === 'blur' || event.which === 13) && label.getAttribute('contenteditable')) {
      var isFolder = label.className.indexOf('folder') !== -1
      var save = textUnderEdit !== label.innerText
      if (save) {
        modalDialogCustom.confirm('Confirm to rename a file', 'Are you sure you want to rename this file?', () => { rename() }, () => { label.innerText = textUnderEdit })
      }
      label.removeAttribute('contenteditable')
      label.classList.remove('bg-light')
    }
  }
}

fileExplorer.prototype.updatePath = function (path) {
  this.files.resolveDirectory(path, (error, fileTree) => {
    if (error) console.error(error)
    if (!fileTree) return
    var newTree = normalize(path, fileTree)
    this.treeView.updateNodeFromJSON(path, newTree, true)
  })
}

fileExplorer.prototype.hide = function () {
  if (this.container) this.container.style.display = 'none'
}

fileExplorer.prototype.show = function () {
  if (this.container) this.container.style.display = 'block'
}

fileExplorer.prototype.init = function () {
  this.container = yo`<div></div>`
  return this.container
}

fileExplorer.prototype.publishToGist = function () {
  modalDialogCustom.confirm(
    'Create a public gist',
    'Are you sure you want to publish all your files anonymously as a public gist on github.com?',
    () => { this.toGist() }
  )
}

fileExplorer.prototype.uploadFile = function (event) {
  // TODO The file explorer is merely a view on the current state of
  // the files module. Please ask the user here if they want to overwrite
  // a file and then just use `files.add`. The file explorer will
  // pick that up via the 'fileAdded' event from the files module.

  let self = this

  ;[...event.target.files].forEach((file) => {
    let files = this.files
    function loadFile () {
      var fileReader = new FileReader()
      fileReader.onload = function (event) {
        if (helper.checkSpecialChars(file.name)) {
          modalDialogCustom.alert('Special characters are not allowed')
          return
        }
        var success = files.set(name, event.target.result)
        if (!success) {
          modalDialogCustom.alert('Failed to create file ' + name)
        } else {
          self.events.trigger('focus', [name])
        }
      }
      fileReader.readAsText(file)
    }
    var name = files.type + '/' + file.name
    files.exists(name, (error, exist) => {
      if (error) console.log(error)
      if (!exist) {
        loadFile()
      } else {
        modalDialogCustom.confirm('Confirm overwrite', `The file ${name} already exists! Would you like to overwrite it?`, () => { loadFile() })
      }
    })
  })
}

fileExplorer.prototype.toGist = function (id) {
  let proccedResult = function (error, data) {
    if (error) {
      modalDialogCustom.alert('Failed to manage gist: ' + error)
    } else {
      if (data.html_url) {
        modalDialogCustom.confirm('Gist is ready', `The gist is at ${data.html_url}. Would you like to open it in a new window?`, () => {
          window.open(data.html_url, '_blank')
        })
      } else {
        modalDialogCustom.alert(data.message + ' ' + data.documentation_url + ' ' + JSON.stringify(data.errors, null, '\t'))
      }
    }
  }

  this.packageFiles(this.files, (error, packaged) => {
    if (error) {
      console.log(error)
      modalDialogCustom.alert('Failed to create gist: ' + error)
    } else {
      var tokenAccess = this._deps.config.get('settings/gist-access-token')
      if (!tokenAccess) {
        modalDialogCustom.alert(
          'Remix requires an access token (which includes gists creation permission). Please go to the settings tab to create one.'
        )
      } else {
        var description = 'Created using remix-ide: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://remix.ethereum.org/#version=' +
          queryParams.get().version +
          '&optimize=' +
          queryParams.get().optimize +
          '&gist='
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
            proccedResult(error, result)
          })
        } else {
          tooltip('Creating a new gist ...')
          gists.create({
            description: description,
            public: true,
            files: packaged
          }, (error, result) => {
            proccedResult(error, result)
          })
        }
      }
    }
  })
}

// return all the files, except the temporary/readonly ones..
fileExplorer.prototype.packageFiles = function (filesProvider, callback) {
  var ret = {}
  filesProvider.resolveDirectory(filesProvider.type, (error, files) => {
    if (error) callback(error)
    else {
      async.eachSeries(Object.keys(files), (path, cb) => {
        filesProvider.get(path, (error, content) => {
          if (/^\s+$/.test(content) || !content.length) {
            content = '// this line is added to create a gist. Empty file is not allowed.'
          }
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

// ------------------ copy files --------------
fileExplorer.prototype.copyFiles = function () {
  let self = this
  modalDialogCustom.prompt(
    'Copy files from browser explorer',
    'To which other remix-ide instance do you want to copy over all files?',
    'https://remix.ethereum.org',
    (target) => {
      doCopy(target)
    }
  )
  function doCopy (target) {
    // package only files from the browser storage.
    self.packageFiles(self.files, (error, packaged) => {
      if (error) {
        console.log(error)
      } else {
        let iframe = yo`
          <iframe src=${target} style='display:none;'></iframe>
        `
        iframe.onload = function () {
          iframe.contentWindow.postMessage(['loadFiles', packaged], '*')
          tooltip('Files copied successfully.')
        }
        document.querySelector('body').appendChild(iframe)
      }
    })
  }
}

// ------------------ gist publish --------------
fileExplorer.prototype.updateGist = function () {
  let self = this
  var gistId = this.files.id
  var fileList = Object.keys(this.files.files)
  // fileList is an array of files in the github gist - not the updated one
  var updatedFileList

  // loop through fileList and check if each element is in updatedFileList

  // if one is not there in updated file list add it and make its content null


  self.packageFiles(self.files, (error, packaged) => {
      if (error) {
        console.log(error)
      } else {
        updatedFileList = Object.keys(packaged)
      }
    })

  if (!gistId) {
    tooltip('no gist content is currently loaded.')
  } else {
    // check that the file list is still the same
    // console.log('RS ' , this.files)
    // make an array with just the names of the files
    
    // self.packageFiles(self.files, (error, packaged) => {
    //   if (error) {
    //     console.log(error)
    //   } else {
    //     console.log('file list is: ', packaged)
    //   }
    // })

    this.toGist(gistId)
  }
}

fileExplorer.prototype.createNewFile = function () {
  let self = this
  modalDialogCustom.prompt('Create new file', 'File Name', 'Untitled.sol', (input) => {
    helper.createNonClashingName(input, self.files, (error, newName) => {
      if (error) return modalDialogCustom.alert('Failed to create file ' + newName + ' ' + error)
      if (!self.files.set(newName, '')) {
        modalDialogCustom.alert('Failed to create file ' + newName)
      } else {
        var file = self.files.type + '/' + newName
        self._deps.fileManager.switchFile(file)
        if (file.includes('_test.sol')) {
          self.event.trigger('newTestFileCreated', [file])
        }
      }
    })
  }, null, true)
}

fileExplorer.prototype.renderMenuItems = function () {
  let items = ''
  if (this.menuItems) {
    items = this.menuItems.map(({action, title, icon}) => {
      if (action === 'uploadFile') {
        return yo`
          <label class="${icon} ${css.newFile}"  title="${title}">
            <input type="file" onchange=${(event) => {
              event.stopPropagation()
              this.uploadFile(event)
            }} multiple />
          </label>
        `
      } else {
        return yo`
        <span onclick=${(event) => { event.stopPropagation(); this[ action ]() }} class="newFile ${icon} ${css.newFile}" title=${title}></span>
        `
      }
    })
  }
  return yo`<span class=" ${css.menu}">${items}</span>`
}

fileExplorer.prototype.ensureRoot = function (cb) {
  cb = cb || (() => {})
  var self = this
  if (self.element) return cb()

  self.files.resolveDirectory('/', (error, files) => {
    if (error) console.error(error)
    var element = self.treeView.render(files, false)
    element.classList.add(css.fileexplorer)
    element.events = self.events
    element.api = self.api
    self.container.appendChild(element)
    self.element = element
    if (cb) cb()
    self.treeView.expand(self.files.type)
  })
}

function normalize (path, filesList) {
  var prefix = path.split('/')[0]
  var newList = {}
  Object.keys(filesList).forEach(key => {
    newList[prefix + '/' + key] = filesList[key].isDirectory ? {} : { '/content': true }
  })
  return newList
}

module.exports = fileExplorer
