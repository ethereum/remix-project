var yo = require('yo-yo')
var csjs = require('csjs-inject')
var Treeview = require('remix-debugger').ui.TreeView
var modalDialog = require('../ui/modaldialog')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

var helper = require('../../lib/helper')

var styleGuide = remixLib.ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .fileexplorer       {
    box-sizing        : border-box;
  }
  input[type="file"] {
      display: none;
  }
  .folder,
  .file               {
    font-size         : 14px;
    cursor            : pointer;
  }
  .file               {
    color             : ${styles.leftPanel.text_Teriary};
  }
  .hasFocus           {
    background-color  : ${styles.leftPanel.backgroundColor_FileExplorer};
  }
  .rename             {
    background-color  : ${styles.leftPanel.backgroundColor_Panel};
  }
  .remove             {
    margin-left       : auto;
    padding-left      : 5px;
    padding-right     : 5px;
  }
  .activeMode         {
    display           : flex;
    width             : 100%;
    margin-right      : 10px;
    padding-right     : 19px;
  }
  .activeMode > div   {
    min-width         : 10px;
  }
  ul                  {
    padding           : 0;
  }
`
module.exports = fileExplorer

function fileExplorer (appAPI, files) {
  var self = this
  this.events = new EventManager()
  // file provider backend
  this.files = files
  // element currently focused on
  this.focusElement = null
  // path currently focused on
  this.focusPath = null

  // warn if file changed outside of Remix
  function remixdDialog () {
    return yo`<div>This file has been changed outside of Remix IDE.</div>`
  }

  this.files.event.register('fileExternallyChanged', (path, file) => {
    if (appAPI.config.get('currentFile') === path && appAPI.currentContent() !== file.content) {
      modalDialog(path + ' changed', remixdDialog(),
        {
          label: 'Keep the content displayed in Remix',
          fn: () => {}
        },
        {
          label: 'Replace by the new content',
          fn: () => {
            appAPI.setText(file.content)
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
    var label = this.treeView.labelAt(filepath)
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
        onclick=${editModeOn}
        onkeydown=${editModeOff}
        onblur=${editModeOff}
      >${key.split('/').pop()}</label>`
    }
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
      appAPI.config.set('currentFile', key)
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
  appAPI.event.register('currentFileChanged', (newFile, explorer) => {
    if (self.focusElement && explorer.type !== files.type && self.focusPath !== newFile) {
      self.focusElement.classList.remove(css.hasFocus)
      self.focusElement = null
      self.focusPath = null
    }
  })

  var textUnderEdit = null
  var textInRename = false

  function editModeOn (event) {
    if (self.files.readonly) return
    var label = this
    var li = label.parentElement.parentElement.parentElement
    var classes = li.className
    if (~classes.indexOf('hasFocus') && !label.getAttribute('contenteditable') && label.getAttribute('data-path') !== self.files.type) {
      textUnderEdit = label.innerText
      label.setAttribute('contenteditable', true)
      label.classList.add(css.rename)
      label.focus()
    }
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
      } else if (!files.exists(newPath)) {
        files.rename(label.dataset.path, newPath, isFolder)
      } else {
        modalDialogCustom.alert('File already exists.')
        label.innerText = textUnderEdit
      }
    }

    if (event.which === 13) event.preventDefault()
    if (!textInRename && (event.type === 'blur' || event.which === 27 || event.which === 13) && label.getAttribute('contenteditable')) {
      textInRename = true
      var isFolder = label.className.indexOf('folder') !== -1
      var save = textUnderEdit !== label.innerText
      if (save) {
        modalDialogCustom.confirm(null, 'Do you want to rename?', () => { rename() }, () => { label.innerText = textUnderEdit })
      }
      label.removeAttribute('contenteditable')
      label.classList.remove(css.rename)
      textInRename = false
    }
  }
}

fileExplorer.prototype.init = function () {
  this.container = yo`<div></div>`
  return this.container
}

fileExplorer.prototype.ensureRoot = function (cb) {
  var self = this
  if (self.element && cb) return cb()

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
