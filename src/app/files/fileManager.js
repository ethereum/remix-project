'use strict'

var $ = require('jquery')
var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager

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
    var self = this
    if (newfile) {
      this.tabbedFiles[newfile] = newfile
    }

    var $filesEl = $('#files')
    $filesEl.find('.file').remove()

    for (var file in this.tabbedFiles) {
      $filesEl.append($('<li class="file"><span class="name">' + file + '</span><span class="remove"><i class="fa fa-close"></i></span></li>'))
    }
    var currentFileOpen = !!this.opt.config.get('currentFile')

    if (currentFileOpen) {
      var active = $('#files .file').filter(function () { return $(this).find('.name').text() === self.opt.config.get('currentFile') })
      active.addClass('active')
    }
    $('#input').toggle(currentFileOpen)
    $('#output').toggle(currentFileOpen)
  }

  switchFile (file) {
    if (!file) {
      var fileList = Object.keys(this.opt.filesProviders['browser'].list())
      if (fileList.length) {
        file = fileList[0]
      }
    }
    if (!file) return
    this.saveCurrentFile()
    this.opt.config.set('currentFile', file)
    this.refreshTabs(file)
    this.fileProviderOf(file).get(file, (error, content) => {
      if (error) {
        console.log(error)
      } else {
        if (this.fileProviderOf(file).isReadOnly(file)) {
          this.opt.editor.openReadOnly(file, content)
        } else {
          this.opt.editor.open(file, content)
        }
        this.event.trigger('currentFileChanged', [file, this.fileProviderOf(file)])
      }
    })
  }

  fileProviderOf (file) {
    var provider = file.match(/[^/]*/)
    if (provider !== null) {
      return this.opt.filesProviders[provider[0]]
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
