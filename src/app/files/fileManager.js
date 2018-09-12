'use strict'

var $ = require('jquery')
var remixLib = require('remix-lib')
var yo = require('yo-yo')
var EventManager = remixLib.EventManager
var globalRegistry = require('../../global/registry')

/*
  attach to files event (removed renamed)
  trigger: currentFileChanged
*/

class FileManager {
  constructor (localRegistry) {
    this.tabbedFiles = {}
    this.event = new EventManager()
    this._components = {}
    this._components.registry = localRegistry || globalRegistry
  }

  init () {
    var self = this
    self._deps = {
      compilerImport: self._components.registry.get('compilerimport').api,
      editor: self._components.registry.get('editor').api,
      config: self._components.registry.get('config').api,
      browserExplorer: self._components.registry.get('fileproviders/browser').api,
      localhostExplorer: self._components.registry.get('fileproviders/localhost').api,
      configExplorer: self._components.registry.get('fileproviders/config').api,
      gistExplorer: self._components.registry.get('fileproviders/gist').api,
      filesProviders: self._components.registry.get('fileproviders').api
    }

    self._deps.browserExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    self._deps.localhostExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    self._deps.configExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    self._deps.gistExplorer.event.register('fileRenamed', (oldName, newName, isFolder) => { this.fileRenamedEvent(oldName, newName, isFolder) })
    self._deps.browserExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    self._deps.localhostExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    self._deps.configExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
    self._deps.gistExplorer.event.register('fileRemoved', (path) => { this.fileRemovedEvent(path) })
  }

  fileRenamedEvent (oldName, newName, isFolder) {
    var self = this
    if (!isFolder) {
      self._deps.config.set('currentFile', '')
      self._deps.editor.discard(oldName)
      if (this.tabbedFiles[oldName]) {
        delete this.tabbedFiles[oldName]
        this.tabbedFiles[newName] = newName
      }
      this.switchFile(newName)
    } else {
      var newFocus
      for (var k in this.tabbedFiles) {
        if (k.indexOf(oldName + '/') === 0) {
          var newAbsolutePath = k.replace(oldName, newName)
          this.tabbedFiles[newAbsolutePath] = newAbsolutePath
          delete this.tabbedFiles[k]
          if (self._deps.config.get('currentFile') === k) {
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

  currentFileProvider () {
    var path = this.currentPath()
    if (path) {
      return this.fileProviderOf(path)
    }
    return null
  }

  currentFile () {
    var self = this
    return self._deps.config.get('currentFile')
  }

  currentPath () {
    var self = this
    var currentFile = self._deps.config.get('currentFile')
    var reg = /(.*)(\/).*/
    var path = reg.exec(currentFile)
    return path ? path[1] : null
  }

  fileRemovedEvent (path) {
    var self = this
    if (path === self._deps.config.get('currentFile')) {
      self._deps.config.set('currentFile', '')
    }
    self._deps.editor.discardCurrentSession()
    delete this.tabbedFiles[path]
    this.refreshTabs()
    this.switchFile()
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
    $('#output').toggle(active)
  }

  switchFile (file) {
    var self = this
    if (file) return _switchFile(file)
    else {
      var browserProvider = self._deps.filesProviders['browser']
      browserProvider.resolveDirectory('browser', (error, filesTree) => {
        if (error) console.error(error)
        var fileList = Object.keys(filesTree)
        if (fileList.length) {
          _switchFile(browserProvider.type + '/' + fileList[0])
        } else {
          self.event.trigger('currentFileChanged', [])
          self._deps.editor.displayEmptyReadOnlySession()
        }
      })
    }
    function _switchFile (file) {
      self.saveCurrentFile()
      self._deps.config.set('currentFile', file)
      self.refreshTabs(file)
      self.fileProviderOf(file).get(file, (error, content) => {
        if (error) {
          console.log(error)
        } else {
          if (self.fileProviderOf(file).isReadOnly(file)) {
            self._deps.editor.openReadOnly(file, content)
          } else {
            self._deps.editor.open(file, content)
          }
          self.event.trigger('currentFileChanged', [file, self.fileProviderOf(file)])
        }
      })
    }
  }

  filesFromPath (path, cb) {
    var provider = this.fileProviderOf(path)
    if (provider) {
      return provider.resolveDirectory(path, (error, filesTree) => { cb(error, filesTree) })
    }
    cb(`provider for path ${path} not found`)
  }

  fileProviderOf (file) {
    if (!file) return null
    var provider = file.match(/[^/]*/)
    if (provider !== null && this._deps.filesProviders[provider[0]]) {
      return this._deps.filesProviders[provider[0]]
    } else {
      for (var handler of this._deps.compilerImport.handlers()) {
        if (handler.match.exec(file)) {
          return this._deps.filesProviders[handler.type]
        }
      }
    }
    return null
  }

  saveCurrentFile () {
    var currentFile = this._deps.config.get('currentFile')
    if (currentFile && this._deps.editor.current()) {
      var input = this._deps.editor.get(currentFile)
      if (input) {
        var provider = this.fileProviderOf(currentFile)
        if (provider) {
          provider.set(currentFile, input)
        } else {
          console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
        }
      }
    }
  }

  syncEditor (path) {
    var self = this
    var currentFile = this._deps.config.get('currentFile')
    if (path !== currentFile) return

    var provider = this.fileProviderOf(currentFile)
    if (provider) {
      provider.get(currentFile, (error, content) => {
        if (error) console.log(error)
        self._deps.editor.setText(content)
      })
    } else {
      console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
    }
  }
}

module.exports = FileManager
