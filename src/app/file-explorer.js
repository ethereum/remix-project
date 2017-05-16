/* global FileReader, confirm, alert */
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var Treeview = require('ethereum-remix').ui.TreeView

var EventManager = require('../lib/eventManager')

var css = csjs`
  .fileexplorer       {
    box-sizing        : border-box;
  }
  .folder,
  .file               {
    font-size         : 14px;
  }
  .hasFocus           {
    background-color  : #F4F6FF;
  }
  .rename             {
    background-color  : white;
  }
  .remove             {
    float             : right;
  }
  .activeMode         {
    margin-right      : 10px;
    padding-right     : 19px;
  }
  ul                  {
    padding           : 0;
  }
`
module.exports = fileExplorer

function fileExplorer (appAPI, files) {
  var fileEvents = files.event
  var treeView = new Treeview({
    extractData: function (value, tree, key) {
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
    formatSelf: function (key, data) {
      return yo`<label class=${data.children ? css.folder : css.file}
        data-path="${data.path}"
        onload=${function (el) { adaptEnvironment(el, focus, hover) }}
        onunload=${function (el) { unadaptEnvironment(el, focus, hover) }}
        onclick=${editModeOn}
        onkeydown=${editModeOff}
        onblur=${editModeOff}
      >${key}</label>`
    }
  })

  var deleteButton = yo`
    <span class=${css.remove} onclick=${deletePath}>
      <i class="fa fa-trash" aria-hidden="true"></i>
    </span>
  `

  appAPI.event.register('currentFileChanged', (newFile) => {
    fileFocus(newFile)
  })
  fileEvents.register('fileRemoved', fileRemoved)
  fileEvents.register('fileRenamed', fileRenamed)
  fileEvents.register('fileAdded', fileAdded)

  var filepath = null
  var focusElement = null
  var textUnderEdit = null

  var element = treeView.render(files.listAsTree())
  element.className = css.fileexplorer

  var events = new EventManager()
  var api = {}
  api.addFile = function addFile (file) {
    var name = file.name
    if (!files.exists(name) || confirm('The file ' + name + ' already exists! Would you like to overwrite it?')) {
      var fileReader = new FileReader()
      fileReader.onload = function (event) {
        var success = files.set(name, event.target.result)
        if (!success) alert('Failed to create file ' + name)
        else events.trigger('focus', [name])
      }
      fileReader.readAsText(file)
    }
  }

  function focus (event) {
    event.cancelBubble = true
    var li = this
    if (focusElement === li) return
    if (focusElement) focusElement.classList.toggle(css.hasFocus)
    focusElement = li
    focusElement.classList.toggle(css.hasFocus)
    var label = getLabelFrom(li)
    var filepath = label.dataset.path
    var isFile = label.className.indexOf('file') === 0
    if (isFile) events.trigger('focus', [filepath])
  }

  function hover (event) {
    if (event.type === 'mouseout') {
      var exitedTo = event.toElement || event.relatedTarget
      if (this.contains(exitedTo)) return
      this.style.backgroundColor = ''
      this.style.paddingRight = '19px'
      return this.removeChild(deleteButton)
    }
    this.style.backgroundColor = '#F4F6FF'
    this.style.paddingRight = '0px'
    this.appendChild(deleteButton)
  }

  function getElement (path) {
    var label = element.querySelector(`label[data-path="${path}"]`)
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
    if (confirm(`Do you really want to delete "${path}" ?`)) {
      li.parentElement.removeChild(li)
      removeSubtree(files, path)
    }
  }

  function editModeOn (event) {
    var label = this
    var li = getLiFrom(label)
    var classes = li.className
    if (~classes.indexOf('hasFocus') && !label.getAttribute('contenteditable')) {
      textUnderEdit = label.innerText
      label.setAttribute('contenteditable', true)
      label.classList.add(css.rename)
      label.focus()
    }
  }

  function editModeOff (event) {
    var label = this
    if (event.type === 'blur' || event.which === 27 || event.which === 13) {
      var save = textUnderEdit !== label.innerText
      if (event.which === 13) event.preventDefault()
      if (save && event.which !== 13) save = confirm('Do you want to rename?')
      if (save) renameSubtree(label)
      else label.innerText = textUnderEdit
      label.removeAttribute('contenteditable')
      label.classList.remove(css.rename)
    }
  }

  function renameSubtree (label, dontcheck) {
    var oldPath = label.dataset.path
    var newPath = oldPath
    newPath = newPath.split('/')
    newPath[newPath.length - 1] = label.innerText
    newPath = newPath.join('/')
    if (!dontcheck) {
      var allPaths = Object.keys(files.list())
      for (var i = 0, len = allPaths.length, path, err; i < len; i++) {
        path = allPaths[i]
        if (files.isReadOnly(path)) {
          err = 'path contains readonly elements'
          break
        } else if (path.indexOf(newPath) === 0) {
          err = 'new path is conflicting with another existing path'
          break
        }
      }
    }
    if (err) {
      alert(`couldn't rename - ${err}`)
      label.innerText = textUnderEdit
    } else {
      textUnderEdit = label.innerText
      updateAllLabels([getElement(oldPath)], oldPath, newPath)
    }
  }

  function updateAllLabels (lis, oldPath, newPath) {
    lis.forEach(function (li) {
      var label = getLabelFrom(li)
      var path = label.dataset.path
      var newName = path.replace(oldPath, newPath)
      label.dataset.path = newName
      var isFile = label.className.indexOf('file') === 0
      if (isFile) files.rename(path, newName)
      var ul = li.lastChild
      if (ul.tagName === 'UL') {
        updateAllLabels([...ul.children], oldPath, newPath)
      }
    })
  }

  function fileFocus (path) {
    if (filepath === path) return
    filepath = path
    var el = getElement(filepath)
    expandPathTo(el)
    setTimeout(function focusNode () { el.click() }, 0)
  }

  function fileRemoved (filepath) {
    var li = getElement(filepath)
    if (li) li.parentElement.removeChild(li)
  }

  function fileRenamed (oldName, newName) {
    var li = getElement(oldName)
    if (li) {
      oldName = oldName.split('/')
      newName = newName.split('/')
      var index = oldName.reduce(function (idx, key, i) {
        return oldName[i] !== newName[i] ? i : idx
      }, undefined)
      var newKey = newName[index]
      var oldPath = oldName.slice(0, index + 1).join('/')
      li = getElement(oldPath)
      var label = getLabelFrom(li)
      label.innerText = newKey
      renameSubtree(label, true)
    }
  }

  function fileAdded (filepath) {
    var el = treeView.render(files.listAsTree())
    el.className = css.fileexplorer
    element.parentElement.replaceChild(el, element)
    element = el
  }

  element.events = events
  element.api = api
  return element
}
/******************************************************************************
  HELPER FUNCTIONS
******************************************************************************/
function adaptEnvironment (label, focus, hover) {
  var li = getLiFrom(label)
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
  var li = getLiFrom(label)
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

function removeSubtree (files, path) {
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
}

function expandPathTo (li) {
  while ((li = li.parentElement.parentElement) && li.tagName === 'LI') {
    var caret = li.firstChild.firstChild
    if (caret.classList.contains('fa-caret-right')) caret.click() // expand
  }
}
