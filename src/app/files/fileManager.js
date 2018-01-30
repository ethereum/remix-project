'use strict'

var $ = require('jquery')
var remixLib = require('remix-lib')
var yo = require('yo-yo')
var EventManager = remixLib.EventManager
var imports = require('../compiler/compiler-imports')

/*
  attach to files event (removed renamed)
  opt needs:
   - filesProviders
   - config
   - editor
  trigger: currentFileChanged
*/

class FileManager {
  constructor (opt = {}) {
    this.tabbedFiles = {}
    this.event = new EventManager()

    var self = this
    this.opt = opt
    this.opt.filesProviders['browser'].event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this.opt.filesProviders['localhost'].event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    this.opt.filesProviders['browser'].event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    this.opt.filesProviders['localhost'].event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })

    // tabs
    var $filesEl = $('#files')

    // Switch tab
    $filesEl.on('click', '.file:not(.active)', function (ev) {
      ev.preventDefault()
      self.switchFile($(this).find('.name').text())
      return false
    })

    // Remove current tab
    $filesEl.on('click', '.file .remove', function (ev) {
      ev.preventDefault()
      var name = $(this).parent().find('.name').text()
      delete self.tabbedFiles[name]
      self.refreshTabs()
      if (Object.keys(self.tabbedFiles).length) {
        self.switchFile(Object.keys(self.tabbedFiles)[0])
      } else {
        opt.editor.displayEmptyReadOnlySession()
        self.opt.config.set('currentFile', '')
      }
      return false
    })
  }

  fileRenamedEvent (oldName, newName, isFolder) {
    if (!isFolder) {
      this.opt.config.set('currentFile', '')
      this.opt.editor.discard(oldName)
      if (this.tabbedFiles[oldName]) {
        delete this.tabbedFiles[oldName]
        this.tabbedFiles[newName] = newName
      }
      this.switchFile(newName)
    } else {
      var newFocus
      for (var k in this.opt.tabbedFiles) {
        if (k.indexOf(oldName + '/') === 0) {
          var newAbsolutePath = k.replace(oldName, newName)
          this.tabbedFiles[newAbsolutePath] = newAbsolutePath
          delete this.tabbedFiles[k]
          if (this.opt.config.get('currentFile') === k) {
            newFocus = newAbsolutePath
          }
        }
      }
      if (newFocus) {
        this.switchFile(newFocus)
      }
    }
    this.refreshTabs()
  }

  currentPath () {
    var currentFile = this.opt.config.get('currentFile')
    var reg = /(.*\/).*/
    var path = reg.exec(currentFile)
    return path ? path[1] : null
  }

  fileRemovedEvent (path) {
    if (path === this.opt.config.get('currentFile')) {
      this.opt.config.set('currentFile', '')
    }
    this.opt.editor.discard(path)
    delete this.tabbedFiles[path]
    this.refreshTabs()
  }

  // Display files that have already been selected
  refreshTabs (newfile) {
    if (newfile) {
      this.tabbedFiles[newfile] = newfile
    }

    var $filesEl = $('#files')
    $filesEl.find('.file').remove()

    for (var file in this.tabbedFiles) {
      $filesEl.append(yo`<li class="file"><span class="name">${file}</span><span class="remove"><i class="fa fa-close"></i></span></li>`)
    }

    var active = $('#files .file').filter(function () {
      return $(this).find('.name').text() === newfile
    })
    if (active.length) active.addClass('active')
    else this.switchFile()
    // $('#input').toggle(active)
    $('#output').toggle(active)
  }

  switchFile (file) {
    var self = this
    if (!file) {
      self.opt.filesProviders['browser'].resolveDirectory('/', (error, filesTree) => {
        if (error) console.error(error)
        var fileList = Object.keys(flatten(filesTree))
        if (fileList.length) {
          file = fileList[0]
          if (file) _switchFile(file)
        } else {
          self.event.trigger('currentFileChanged', [])
        }
      })
    } else _switchFile(file)
    function _switchFile (file) {
      self.saveCurrentFile()
      self.refreshTabs(file)
      self.fileProviderOf(file).get(file, (error, content) => {
        if (error) {
          console.log(error)
        } else {
          if (self.fileProviderOf(file).isReadOnly(file)) {
            self.opt.editor.openReadOnly(file, content)
          } else {
            self.opt.editor.open(file, content)
          }
          self.event.trigger('currentFileChanged', [file, self.fileProviderOf(file)])
        }
      })
    }
  }

  fileProviderOf (file) {
    var provider = file.match(/[^/]*/)
    if (provider !== null && this.opt.filesProviders[provider[0]]) {
      return this.opt.filesProviders[provider[0]]
    } else {
      for (var handler of imports.handlers()) {
        if (handler.match.exec(file)) {
          return this.opt.filesProviders[handler.type]
        }
      }
    }
    return null
  }

  saveCurrentFile () {
    var currentFile = this.opt.config.get('currentFile')
    if (currentFile && this.opt.editor.current()) {
      var input = this.opt.editor.get(currentFile)
      var provider = this.fileProviderOf(currentFile)
      if (provider) {
        provider.set(currentFile, input)
      } else {
        console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
      }
    }
  }
}

module.exports = FileManager

function flatten (tree) {
  var flat = {}
  var names = Object.keys(tree || {})
  if (!names.length) return
  else {
    names.forEach(name => {
      if ('/content' in tree[name]) flat[name] = false
      else {
        var subflat = flatten(tree[name])
        if (!subflat) {
          // empty folder
        } else {
          Object.keys(subflat).forEach(path => { flat[name + '/' + path] = false })
        }
      }
    })
    return flat
  }
}
