var utils = require('./utils');

var ace = require('brace');
require('../mode-solidity.js');

function Editor (loadingFromGist) {

  this.newFile = function () {
    untitledCount = '';
    while (window.localStorage[SOL_CACHE_UNTITLED + untitledCount]) {
      untitledCount = (untitledCount - 0) + 1;
    }
    SOL_CACHE_FILE = SOL_CACHE_UNTITLED + untitledCount;
    sessions[SOL_CACHE_FILE] = null;
    this.setCacheFileContent('');
  };

  this.setCacheFileContent = function (content) {
    window.localStorage.setItem(SOL_CACHE_FILE, content);
  };

  this.setCacheFile = function (cacheFile) {
    SOL_CACHE_FILE = utils.fileKey(cacheFile);
  };

  this.getCacheFile = function () {
    return utils.fileNameFromKey(SOL_CACHE_FILE);
  };

  this.cacheFileIsPresent = function () {
    return !!SOL_CACHE_FILE;
  };

  this.setNextFile = function (fileKey) {
    var index = this.getFiles().indexOf(fileKey);
    this.setCacheFile(this.getFiles()[ Math.max(0, index - 1) ]);
  };

  this.resetSession = function () {
    editor.setSession(sessions[SOL_CACHE_FILE]);
    editor.focus();
  };

  this.hasFile = function (name) {
    return this.getFiles().indexOf(utils.fileKey(name)) !== -1
  };

  this.getFiles = function () {
    var files = [];
    for (var f in localStorage) {
      if (f.indexOf(utils.getCacheFilePrefix(), 0) === 0) {
        files.push(f);
        if (!sessions[f]) sessions[f] = newEditorSession(f);
      }
    }
    return files;
  }

  this.packageFiles = function () {
    var files = {};
    var filesArr = this.getFiles();

    for (var f in filesArr) {
      files[utils.fileNameFromKey(filesArr[f])] = {
        content: localStorage[filesArr[f]]
      };
    }
    return files;
  };

  this.resize = function () {
    editor.resize();
    var session = editor.getSession();
    session.setUseWrapMode(document.querySelector('#editorWrap').checked);
    if (session.getUseWrapMode()) {
      var characterWidth = editor.renderer.characterWidth;
      var contentWidth = editor.container.ownerDocument.getElementsByClassName('ace_scroller')[0].clientWidth;

      if (contentWidth > 0) {
        session.setWrapLimit(parseInt(contentWidth / characterWidth, 10));
      }
    }
  };

  this.getValue = function () {
    return editor.getValue();
  };

  this.clearAnnotations = function () {
    editor.getSession().clearAnnotations();
  };

  this.setAnnotations = function (sourceAnnotations) {
    editor.getSession().setAnnotations(sourceAnnotations);    
  };

  this.onChangeSetup = function (onChange) {
    editor.getSession().on('change', onChange);
    editor.on('changeSession', function () {
      editor.getSession().on('change', onChange);
      onChange();
    })    
  };

  this.handleErrorClick = function (errLine, errCol) {
    editor.focus();
    editor.gotoLine(errLine + 1, errCol - 1, true);    
  };

  function newEditorSession (filekey) {
    var s = new ace.EditSession(window.localStorage[filekey], 'ace/mode/javascript')
    s.setUndoManager(new ace.UndoManager());
    s.setTabSize(4);
    s.setUseSoftTabs(true);
    sessions[filekey] = s;
    return s;
  }

  function setupStuff (files) {
    var untitledCount = '';
    if (!files.length || window.localStorage['sol-cache']) {
      if (loadingFromGist) return;
      // Backwards-compatibility
      while (window.localStorage[SOL_CACHE_UNTITLED + untitledCount]) {
        untitledCount = (untitledCount - 0) + 1;
      }
      SOL_CACHE_FILE = SOL_CACHE_UNTITLED + untitledCount;
      window.localStorage[SOL_CACHE_FILE] = window.localStorage['sol-cache'] || BALLOT_EXAMPLE;
      window.localStorage.removeItem('sol-cache');
    }

    SOL_CACHE_FILE = files[0];
    
    for (var x in files) {
      sessions[files[x]] = newEditorSession(files[x])
    }

    editor.setSession(sessions[SOL_CACHE_FILE]);
    editor.resize(true);
  }

  var SOL_CACHE_UNTITLED = utils.getCacheFilePrefix() + 'Untitled';
  var SOL_CACHE_FILE = null;

  var editor = ace.edit('input');
  var sessions = {};

  setupStuff(this.getFiles());
}

module.exports = Editor;
