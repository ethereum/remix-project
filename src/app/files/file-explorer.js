var yo = require('yo-yo')
var Treeview = require('../ui/TreeView')
var modalDialog = require('../ui/modaldialog')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var contextMenu = require('../ui/contextMenu')
var addTooltip = require('../ui/tooltip')
var helper = require('../../lib/helper')

var css = require('./styles/file-explorer-styles')

var globalRegistry = require('../../global/registry')

let MENU_HANDLE

function fileExplorer (localRegistry, files) {
  var self = this
  this.events = new EventManager()
  // file provider backend
  this.files = files
  // element currently focused on
  this.focusElement = null
  // path currently focused on
  this.focusPath = null

  self._components = {}
  self._components.registry = localRegistry || globalRegistry
  self._deps = {
    config: self._components.registry.get('config').api,
    editor: self._components.registry.get('editor').api,
    fileManager: self._components.registry.get('filemanager').api
  }

  // warn if file changed outside of Remix
  function remixdDialog () {
    return yo`<div>This file has been changed outside of Remix IDE.</div>`
  }

  this.files.event.register('fileExternallyChanged', (path, file) => {
    if (self._deps.config.get('currentFile') === path && self._deps.editor.currentContent() && self._deps.editor.currentContent() !== file.content) {
      modalDialog(path + ' changed', remixdDialog(),
        {
          label: 'Keep the content displayed in Remix',
          fn: () => {}
        },
        {
          label: 'Replace by the new content',
          fn: () => {
            self._deps.editor.setText(file.content)
          }
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
          if (self.focusElement && !self.focusElement.classList.contains(css.hasFocus)) {
            self.focusElement.classList.add(css.hasFocus)
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
      return yo`<label class="${data.children ? css.folder : css.file}"
        data-path="${data.path}"
        style="${isRoot ? 'font-weight:bold;' : ''}"
        onkeydown=${editModeOff}
        onblur=${editModeOff}
      >${key.split('/').pop()}</label>`
    }
  })

  self.treeView.event.register('nodeRightClick', function (key, data, label, event) {
    MENU_HANDLE && MENU_HANDLE.hide(null, true)
    MENU_HANDLE = contextMenu(event, {
      'Rename': () => {
        if (self.files.readonly) { return addTooltip('cannot rename folder. ' + self.files.type + ' is a read only explorer') }
        var name = label.querySelector('label[data-path="' + key + '"]')
        if (name) editModeOn(name)
      },
      'Delete': () => {
        if (self.files.readonly) { return addTooltip('cannot delete folder. ' + self.files.type + ' is a read only explorer') }
        modalDialogCustom.confirm(null, 'Do you want to delete this folder?', () => { files.remove(key) }, () => {})
      }
    })
  })

  self.treeView.event.register('leafRightClick', function (key, data, label, event) {
    MENU_HANDLE && MENU_HANDLE.hide(null, true)
    MENU_HANDLE = contextMenu(event, {
      'Rename': () => {
        if (self.files.readonly) { return addTooltip('cannot rename file. ' + self.files.type + ' is a read only explorer') }
        var name = label.querySelector('label[data-path="' + key + '"]')
        if (name) editModeOn(name)
      },
      'Delete': () => {
        if (self.files.readonly) { return addTooltip('cannot delete file. ' + self.files.type + ' is a read only explorer') }
        modalDialogCustom.confirm(null, 'Do you want to delete this file?', () => { files.remove(key) }, () => {})
      }
    })
  })

  self.treeView.event.register('leafClick', function (key, data, label) {
    if (self.focusElement) {
      self.focusElement.classList.remove(css.hasFocus)
      self.focusElement = null
      self.focusPath = null
    }
    self.focusElement = self.treeView.labelAt(key)
    if (self.focusElement) {
      self.focusElement.classList.add(css.hasFocus)
      self.focusPath = key
      self.events.trigger('focus', [key])
    }
  })

  self.treeView.event.register('nodeClick', function (path, childrenContainer) {
    if (!childrenContainer) return
    if (childrenContainer.style.display === 'none') return

    files.resolveDirectory(path, (error, fileTree) => {
      if (error) console.error(error)
      if (!fileTree) return
      var newTree = normalize(path, fileTree)
      self.treeView.updateNodeFromJSON(path, newTree, true)
    })
  })

  function normalize (path, filesList) {
    var prefix = path.split('/')[0]
    var newList = {}
    Object.keys(filesList).forEach(key => {
      newList[prefix + '/' + key] = filesList[key].isDirectory ? {} : { '/content': true }
    })
    return newList
  }

  // register to main app, trigger when the current file in the editor changed
  self._deps.fileManager.event.register('currentFileChanged', (newFile, explorer) => {
    if (self.focusElement && (!explorer || explorer.type !== files.type) && self.focusPath !== newFile) {
      self.focusElement.classList.remove(css.hasFocus)
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
    label.classList.add(css.rename)
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
        modalDialogCustom.confirm(null, 'Do you want to rename?', () => { rename() }, () => { label.innerText = textUnderEdit })
      }
      label.removeAttribute('contenteditable')
      label.classList.remove(css.rename)
    }
  }
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

fileExplorer.prototype.ensureRoot = function (cb) {
  cb = cb || (() => {})
  var self = this
  if (self.element) return cb()

  self.files.resolveDirectory('/', (error, files) => {
    if (error) console.error(error)
    var element = self.treeView.render(files, false)
    element.className = css.fileexplorer
    element.events = self.events
    element.api = self.api
    self.container.appendChild(element)
    self.element = element
    if (cb) cb()
  })
}

module.exports = fileExplorer
