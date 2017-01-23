/* global FileReader */
'use strict'

var EventManager = require('../lib/eventManager')
var examples = require('./example-contracts')

var ace = require('brace')
require('../mode-solidity.js')

function Editor (doNotLoadStorage, storage) {
  var SOL_CACHE_FILE = null

  var editor = ace.edit('input')
  document.getElementById('input').editor = editor // required to access the editor during tests
  var event = new EventManager()
  this.event = event
  var sessions = {}
  var sourceAnnotations = []

  this.addMarker = function (range, cssClass) {
    return editor.session.addMarker(range, cssClass)
  }

  this.removeMarker = function (markerId) {
    editor.session.removeMarker(markerId)
  }

  this.newFile = function () {
    var untitledCount = ''
    while (storage.exists('Untitled' + untitledCount)) {
      untitledCount = (untitledCount - 0) + 1
    }
    this.setCacheFile('Untitled' + untitledCount)
    this.setCacheFileContent('')
  }

  this.uploadFile = function (file, callback) {
    var fileReader = new FileReader()
    var name = file.name

    var self = this
    fileReader.onload = function (e) {
      self.setCacheFile(name)
      self.setCacheFileContent(e.target.result)
      callback()
    }
    fileReader.readAsText(file)
  }

  this.setCacheFileContent = function (content) {
    storage.set(SOL_CACHE_FILE, content)
  }

  this.setCacheFile = function (cacheFile) {
    SOL_CACHE_FILE = cacheFile
  }

  this.getCacheFile = function () {
    return SOL_CACHE_FILE
  }

  this.cacheFileIsPresent = function () {
    return !!SOL_CACHE_FILE
  }

  this.setNextFile = function (fileKey) {
    var index = this.getFiles().indexOf(fileKey)
    this.setCacheFile(this.getFiles()[ Math.max(0, index - 1) ])
  }

  this.resetSession = function () {
    editor.setSession(sessions[this.getCacheFile()])
    editor.focus()
  }

  this.removeSession = function (fileKey) {
    delete sessions[fileKey]
  }

  this.renameSession = function (oldFileKey, newFileKey) {
    if (oldFileKey !== newFileKey) {
      sessions[newFileKey] = sessions[oldFileKey]
      this.removeSession(oldFileKey)
    }
  }

  this.hasFile = function (name) {
    return this.getFiles().indexOf(name) !== -1
  }

  this.getFile = function (name) {
    return storage.get(name)
  }

  function getFiles () {
    var files = []
    storage.keys().forEach(function (f) {
      // NOTE: as a temporary measure do not show the config file in the editor
      if (f !== '.browser-solidity.json') {
        files.push(f)
        if (!sessions[f]) sessions[f] = newEditorSession(f)
      }
    })
    return files
  }
  this.getFiles = getFiles

  this.packageFiles = function () {
    var files = {}
    var filesArr = this.getFiles()

    for (var f in filesArr) {
      files[filesArr[f]] = {
        content: storage.get(filesArr[f])
      }
    }
    return files
  }

  this.resize = function () {
    editor.resize()
    var session = editor.getSession()
    session.setUseWrapMode(document.querySelector('#editorWrap').checked)
    if (session.getUseWrapMode()) {
      var characterWidth = editor.renderer.characterWidth
      var contentWidth = editor.container.ownerDocument.getElementsByClassName('ace_scroller')[0].clientWidth

      if (contentWidth > 0) {
        session.setWrapLimit(parseInt(contentWidth / characterWidth, 10))
      }
    }
  }

  this.getValue = function () {
    return editor.getValue()
  }

  this.clearAnnotations = function () {
    sourceAnnotations = []
    editor.getSession().clearAnnotations()
  }

  this.addAnnotation = function (annotation) {
    sourceAnnotations[sourceAnnotations.length] = annotation
    this.setAnnotations(sourceAnnotations)
  }

  this.setAnnotations = function (sourceAnnotations) {
    editor.getSession().setAnnotations(sourceAnnotations)
  }

  this.handleErrorClick = function (errLine, errCol) {
    editor.focus()
    editor.gotoLine(errLine + 1, errCol - 1, true)
  }

  function newEditorSession (filekey) {
    var s = new ace.EditSession(storage.get(filekey), 'ace/mode/javascript')
    s.setUndoManager(new ace.UndoManager())
    s.setTabSize(4)
    s.setUseSoftTabs(true)
    sessions[filekey] = s
    return s
  }

  // Do setup on initialisation here
  editor.on('changeSession', function () {
    event.trigger('sessionSwitched', [])

    editor.getSession().on('change', function () {
      event.trigger('contentChanged', [])
    })
  })

  // Unmap ctrl-t & ctrl-f
  editor.commands.bindKeys({ 'ctrl-t': null })
  editor.commands.bindKeys({ 'ctrl-f': null })

  if (doNotLoadStorage) {
    return
  }

  var files = getFiles()

  if (files.length === 0) {
    files.push(examples.ballot.name)
    storage.set(examples.ballot.name, examples.ballot.content)
  }

  this.setCacheFile(files[0])

  for (var x in files) {
    sessions[files[x]] = newEditorSession(files[x])
  }

  editor.setSession(sessions[this.getCacheFile()])
  editor.resize(true)
}

module.exports = Editor
