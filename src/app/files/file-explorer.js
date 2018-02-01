/* global FileReader */
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

var focusElement = null

function fileExplorer (appAPI, files) {
  var self = this
  this.events = new EventManager()
  this.files = files

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

  var fileEvents = files.event

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
        onload=${function (el) { adaptEnvironment(el, focus, hover, li) }}
        onunload=${function (el) { unadaptEnvironment(el, focus, hover, li) }}
        onclick=${editModeOn}
        onkeydown=${editModeOff}
        onblur=${editModeOff}
      >${key.split('/').pop()}</label>`
    }
  })

  self.treeView.event.register('nodeClick', function (path, childrenContainer) {
    if (!childrenContainer) return
    if (childrenContainer.style.display === 'none') {
      childrenContainer.innerHTML = ''
      return
    }
    files.resolveDirectory(path, (error, fileTree) => {
      if (error) console.error(error)
      if (!fileTree) return
      var newTree = normalize(path, fileTree)
      newTree = self.treeView.renderProperties(newTree, false)
      self.treeView.updateNode(path, newTree)
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

  var deleteButton = yo`
    <span class=${css.remove} onclick=${deletePath}>
      <i class="fa fa-trash" aria-hidden="true"></i>
    </span>
  `
  appAPI.event.register('currentFileChanged', (newFile, explorer) => {
    if (explorer === files) {
      fileFocus(newFile)
    } else {
      var currentFile = appAPI.config.get('currentFile')
      if (currentFile === newFile) return
      unfocus(focusElement)
    }
  })
  fileEvents.register('fileRemoved', fileRemoved)
  fileEvents.register('fileRenamed', fileRenamed)
  fileEvents.register('fileRenamedError', fileRenamedError)
  fileEvents.register('fileAdded', fileAdded)

  var textUnderEdit = null
  var textInRename = false

  self.api = {}
  self.api.addFile = function addFile (file) {
    function loadFile () {
      var fileReader = new FileReader()
      fileReader.onload = function (event) {
        if (helper.checkSpecialChars(file.name)) {
          modalDialogCustom.alert('Special characters are not allowed')
          return
        }
        var success = files.set(name, event.target.result)
        if (!success) modalDialogCustom.alert('Failed to create file ' + name)
        else self.events.trigger('focus', [name])
      }
      fileReader.readAsText(file)
    }

    var name = files.type + '/' + file.name
    if (!files.exists(name)) {
      loadFile()
    } else {
      modalDialogCustom.confirm(null, `The file ${name} already exists! Would you like to overwrite it?`, () => { loadFile() })
    }
  }

  function focus (event) {
    event.cancelBubble = true
    var li = this
    if (focusElement === li) return
    unfocus(focusElement)
    focusElement = li
    focusElement.classList.toggle(css.hasFocus)
    var label = getLabelFrom(li)
    var filepath = label.dataset.path
    var isFile = label.className.indexOf('file') === 0
    if (isFile) self.events.trigger('focus', [filepath])
  }

  function unfocus (el) {
    if (focusElement) focusElement.classList.toggle(css.hasFocus)
    focusElement = null
  }

  function hover (event) {
    var path = this.querySelector('label').dataset.path
    if (path === self.files.type) return // can't delete the root node

    if (event.type === 'mouseout') {
      var exitedTo = event.toElement || event.relatedTarget
      if (this.contains(exitedTo)) return
      this.style.backgroundColor = ''
      this.style.paddingRight = '19px'
      return this.removeChild(deleteButton)
    }
    this.style.backgroundColor = styles.leftPanel.backgroundColor_FileExplorer
    this.style.paddingRight = '0px'
    this.appendChild(deleteButton)
  }

  function getElement (path) {
    var label = self.element.querySelector(`label[data-path="${path}"]`)
    if (label) return getLiFrom(label)
  }

  function deletePath (event) {
    event.cancelBubble = true
    var span = this
    var li = span.parentElement.parentElement
    var label = getLabelFrom(li)
    var path = label.dataset.path
    var isFolder = !!~label.className.indexOf('folder')
    if (isFolder) path += '/'
    modalDialogCustom.confirm(null, `Do you really want to delete "${path}" ?`, () => {
      li.parentElement.removeChild(li)
      removeSubtree(files, path, isFolder)
    })
  }

  function editModeOn (event) {
    if (self.files.readonly) return
    var label = this
    var li = getLiFrom(label)
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

    function cancelRename () {
      label.innerText = textUnderEdit
    }

    if (event.which === 13) event.preventDefault()
    if (!textInRename && (event.type === 'blur' || event.which === 27 || event.which === 13) && label.getAttribute('contenteditable')) {
      textInRename = true
      var isFolder = label.className.indexOf('folder') !== -1
      var save = textUnderEdit !== label.innerText
      if (save) {
        modalDialogCustom.confirm(null, 'Do you want to rename?', () => { rename() }, () => { cancelRename() })
      }
      label.removeAttribute('contenteditable')
      label.classList.remove(css.rename)
      textInRename = false
    }
  }

  function fileFocus (path) {
    var filepath = appAPI.config.get('currentFile')
    if (filepath === path) return
    var label = document.querySelector(`label[data-path="${path}"]`)
    if (label) {
      appAPI.config.set('currentFile', path)
    }
  }

  function fileRemoved (filepath) {
    var li = getElement(filepath)
    if (li) li.parentElement.removeChild(li)
  }

  function fileRenamed (oldName, newName, isFolder) {
    var li = getElement(oldName)
    if (li) {
      li.parentElement.removeChild(li)
      fileAdded(newName)
    }
  }

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
          var newTree = self.treeView.renderProperties(fileTree, false)
          self.treeView.updateNode(folderpath, newTree)
        })
      }
    })
  }
}

/*
  HELPER FUNCTIONS
*/
function adaptEnvironment (label, focus, hover) {
  var li = getLiFrom(label) // @TODO: maybe this gets refactored?
  li.style.position = 'relative'
  var span = li.firstChild
  // add focus
  li.addEventListener('click', focus)
  // add hover
  span.classList.add(css.activeMode)
  span.addEventListener('mouseover', hover)
  span.addEventListener('mouseout', hover)
}

function unadaptEnvironment (label, focus, hover) {
  var li = getLiFrom(label) // @TODO: maybe this gets refactored?
  var span = li.firstChild
  li.style.position = undefined
  // remove focus
  li.removeEventListener('click', focus)
  // remove hover
  span.classList.remove(css.activeMode)
  span.removeEventListener('mouseover', hover)
  span.removeEventListener('mouseout', hover)
}

function getLiFrom (label) {
  return label.parentElement.parentElement.parentElement
}

function getLabelFrom (li) {
  return li.children[0].children[1].children[0]
}

function removeSubtree (files, path, isFolder) {
  var parts = path.split('/')
  var isFile = parts[parts.length - 1].length
  var removePaths = isFile ? [path] : Object.keys(files.list()).filter(keep)
  function keep (p) { return ~p.indexOf(path) }
  removePaths.forEach(function (path) {
    [...window.files.querySelectorAll('.file .name')].forEach(function (span) {
      if (span.innerText === path) {
        var li = span.parentElement
        li.parentElement.removeChild(li) // delete tab
      }
    })
    files.remove(path)
  })
  if (isFolder) files.remove(path)
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
