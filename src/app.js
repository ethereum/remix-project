/* global alert, confirm, prompt, FileReader, Option, Worker, chrome */
'use strict'

var async = require('async')
var $ = require('jquery')
var base64 = require('js-base64').Base64
var swarmgw = require('swarmgw')

var QueryParams = require('./app/query-params')
var queryParams = new QueryParams()
var GistHandler = require('./app/gist-handler')
var gistHandler = new GistHandler()

var Storage = require('./app/storage')
var Files = require('./app/files')
var Config = require('./app/config')
var Editor = require('./app/editor')
var Renderer = require('./app/renderer')
var Compiler = require('./app/compiler')
var ExecutionContext = require('./app/execution-context')
var UniversalDApp = require('./universal-dapp.js')
var Debugger = require('./app/debugger')
var FormalVerification = require('./app/formalVerification')
var EventManager = require('./lib/eventManager')
var StaticAnalysis = require('./app/staticanalysis/staticAnalysisView')
var OffsetToLineColumnConverter = require('./lib/offsetToLineColumnConverter')

var examples = require('./app/example-contracts')

// The event listener needs to be registered as early as possible, because the
// parent will send the message upon the "load" event.
var filesToLoad = null
var loadFilesCallback = function (files) { filesToLoad = files } // will be replaced later

window.addEventListener('message', function (ev) {
  if (typeof ev.data === typeof [] && ev.data[0] === 'loadFiles') {
    loadFilesCallback(ev.data[1])
  }
}, false)

/*
  trigger tabChanged
*/
var run = function () {
  var self = this
  this.event = new EventManager()
  var storage = new Storage()
  var files = new Files(storage)
  var config = new Config(storage)
  var currentFile

  // return all the files, except the temporary/readonly ones
  function packageFiles () {
    var ret = {}
    Object.keys(files.list())
      .filter(function (path) { if (!files.isReadOnly(path)) { return path } })
      .map(function (path) { ret[path] = { content: files.get(path) } })
    return ret
  }

  function createNonClashingName (path) {
    var counter = ''
    while (files.exists(path + counter)) {
      counter = (counter | 0) + 1
    }
    return path + counter
  }

  // Add files received from remote instance (i.e. another browser-solidity)
  function loadFiles (filesSet) {
    for (var f in filesSet) {
      files.set(createNonClashingName(f), filesSet[f].content)
    }
    switchToNextFile()
  }

  // Replace early callback with instant response
  loadFilesCallback = function (files) {
    loadFiles(files)
  }

  // Run if we did receive an event from remote instance while starting up
  if (filesToLoad !== null) {
    loadFiles(filesToLoad)
  }

  // -------- check file upload capabilities -------

  if (!(window.File || window.FileReader || window.FileList || window.Blob)) {
    $('.uploadFile').remove()
  }

  // ------------------ gist load ----------------

  var loadingFromGist = gistHandler.handleLoad(queryParams.get(), function (gistId) {
    $.ajax({
      url: 'https://api.github.com/gists/' + gistId,
      jsonp: 'callback',
      dataType: 'jsonp',
      success: function (response) {
        if (response.data) {
          if (!response.data.files) {
            alert('Gist load error: ' + response.data.message)
            return
          }
          loadFiles(response.data.files)
        }
      }
    })
  })

  // insert ballot contract if there are no files available
  if (!loadingFromGist && Object.keys(files.list()).length === 0) {
    if (!files.set(examples.ballot.name, examples.ballot.content)) {
      alert('Failed to store example contract in browser. Remix will not work properly. Please ensure Remix has access to LocalStorage. Safari in Private mode is known not to work.')
    }
  }

  // ----------------- Chrome cloud storage sync --------------------

  function chromeCloudSync () {
    if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.sync) {
      return
    }

    var obj = {}
    var done = false
    var count = 0

    function check (key) {
      chrome.storage.sync.get(key, function (resp) {
        console.log('comparing to cloud', key, resp)
        if (typeof resp[key] !== 'undefined' && obj[key] !== resp[key] && confirm('Overwrite "' + key + '"? Click Ok to overwrite local file with file from cloud. Cancel will push your local file to the cloud.')) {
          console.log('Overwriting', key)
          files.set(key, resp[key])
          refreshTabs()
        } else {
          console.log('add to obj', obj, key)
          obj[key] = files.get(key)
        }
        done++
        if (done >= count) {
          chrome.storage.sync.set(obj, function () {
            console.log('updated cloud files with: ', obj, this, arguments)
          })
        }
      })
    }

    for (var y in files.list()) {
      console.log('checking', y)
      obj[y] = files.get(y)
      count++
      check(y)
    }
  }

  window.syncStorage = chromeCloudSync
  chromeCloudSync()

  // ----------------- editor ----------------------

  var editor = new Editor(document.getElementById('input'))

  // ----------------- tabbed menu -------------------
  $('#options li').click(function (ev) {
    var $el = $(this)
    selectTab($el)
  })

  var selectTab = function (el) {
    var match = /[a-z]+View/.exec(el.get(0).className)
    if (!match) return
    var cls = match[0]
    if (!el.hasClass('active')) {
      el.parent().find('li').removeClass('active')
      $('#optionViews').attr('class', '').addClass(cls)
      el.addClass('active')
    }
    self.event.trigger('tabChanged', [cls])
  }

  // ------------------ gist publish --------------

  $('#gist').click(function () {
    if (confirm('Are you sure you want to publish all your files anonymously as a public gist on github.com?')) {
      var files = packageFiles()
      var description = 'Created using browser-solidity: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://ethereum.github.io/browser-solidity/#version=' + queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&gist='

      $.ajax({
        url: 'https://api.github.com/gists',
        type: 'POST',
        data: JSON.stringify({
          description: description,
          public: true,
          files: files
        })
      }).done(function (response) {
        if (response.html_url && confirm('Created a gist at ' + response.html_url + ' Would you like to open it in a new window?')) {
          window.open(response.html_url, '_blank')
        }
      }).fail(function (xhr, text, err) {
        alert('Failed to create gist: ' + (err || 'Unknown transport error'))
      })
    }
  })

  $('#copyOver').click(function () {
    var target = prompt(
      'To which other browser-solidity instance do you want to copy over all files?',
      'https://ethereum.github.io/browser-solidity/'
    )
    if (target === null) {
      return
    }
    var files = packageFiles()
    $('<iframe/>', {
      src: target,
      style: 'display:none;',
      load: function () { this.contentWindow.postMessage(['loadFiles', files], '*') }
    }).appendTo('body')
  })

  // ----------------- file selector-------------

  var $filesEl = $('#files')
  var FILE_SCROLL_DELTA = 300

  $('.newFile').on('click', function () {
    var newName = createNonClashingName('Untitled')
    if (!files.set(newName, '')) {
      alert('Failed to create file ' + newName)
    } else {
      switchToFile(newName)
    }
  })

  // ----------------- file upload -------------

  $('.inputFile').on('change', function () {
    var fileList = $('input.inputFile')[0].files
    for (var i = 0; i < fileList.length; i++) {
      var name = fileList[i].name
      if (!files.exists(name) || confirm('The file ' + name + ' already exists! Would you like to overwrite it?')) {
        var fileReader = new FileReader()
        fileReader.onload = function (ev) {
          if (!files.set(name, ev.target.result)) {
            alert('Failed to create file ' + name)
          } else {
            switchToFile(name)
          }
        }
        fileReader.readAsText(fileList[i])
      }
    }
  })

  // Switch tab
  $filesEl.on('click', '.file:not(.active)', function (ev) {
    ev.preventDefault()
    switchToFile($(this).find('.name').text())
    return false
  })

  // Edit name of current tab
  $filesEl.on('click', '.file.active', function (ev) {
    var $fileTabEl = $(this)
    var originalName = $fileTabEl.find('.name').text()
    ev.preventDefault()
    if ($(this).find('input').length > 0) return false
    var $fileNameInputEl = $('<input value="' + originalName + '"/>')
    $fileTabEl.html($fileNameInputEl)
    $fileNameInputEl.focus()
    $fileNameInputEl.select()
    $fileNameInputEl.on('blur', handleRename)
    $fileNameInputEl.keyup(handleRename)

    function handleRename (ev) {
      ev.preventDefault()
      if (ev.which && ev.which !== 13) return false
      var newName = ev.target.value
      $fileNameInputEl.off('blur')
      $fileNameInputEl.off('keyup')

      if (newName !== originalName && confirm(
          files.exists(newName)
            ? 'Are you sure you want to overwrite: ' + newName + ' with ' + originalName + '?'
            : 'Are you sure you want to rename: ' + originalName + ' to ' + newName + '?')) {
        if (!files.rename(originalName, newName)) {
          alert('Error while renaming file')
        } else {
          currentFile = null
          switchToFile(newName)
          editor.discard(originalName)
        }
      }

      return false
    }

    return false
  })

  // Remove current tab
  $filesEl.on('click', '.file .remove', function (ev) {
    ev.preventDefault()
    var name = $(this).parent().find('.name').text()

    if (confirm('Are you sure you want to remove: ' + name + ' from local storage?')) {
      if (!files.remove(name)) {
        alert('Error while removing file')
      } else {
        currentFile = null
        switchToNextFile()
        editor.discard(name)
      }
    }
    return false
  })

  editor.event.register('sessionSwitched', refreshTabs)

  function switchToFile (file) {
    editorSyncFile()

    currentFile = file

    if (files.isReadOnly(file)) {
      editor.openReadOnly(file, files.get(file))
    } else {
      editor.open(file, files.get(file))
    }
  }

  function switchToNextFile () {
    var fileList = Object.keys(files.list())
    if (fileList.length) {
      switchToFile(fileList[0])
    }
  }

  switchToNextFile()

  // Synchronise tab list with file names known to the editor
  function refreshTabs () {
    var $filesEl = $('#files')
    var fileNames = Object.keys(files.list())

    $filesEl.find('.file').remove()
    $('#output').empty()

    for (var f in fileNames) {
      var name = fileNames[f]
      $filesEl.append($('<li class="file"><span class="name">' + name + '</span><span class="remove"><i class="fa fa-close"></i></span></li>'))
    }

    var currentFileOpen = !!currentFile

    if (currentFileOpen) {
      var active = $('#files .file').filter(function () { return $(this).find('.name').text() === currentFile })
      active.addClass('active')
    }
    $('#input').toggle(currentFileOpen)
    $('#output').toggle(currentFileOpen)

    $filesEl.animate({ left: Math.max((0 - activeFilePos() + (FILE_SCROLL_DELTA / 2)), 0) + 'px' }, 'slow', function () {
      reAdjust()
    })
  }

  var $filesWrapper = $('.files-wrapper')
  var $scrollerRight = $('.scroller-right')
  var $scrollerLeft = $('.scroller-left')

  function widthOfList () {
    var itemsWidth = 0
    $('.file').each(function () {
      var itemWidth = $(this).outerWidth()
      itemsWidth += itemWidth
    })
    return itemsWidth
  }

  //  function widthOfHidden () {
  //    return ($filesWrapper.outerWidth() - widthOfList() - getLeftPosi())
  //  }

  function widthOfVisible () {
    return $filesWrapper.outerWidth()
  }

  function getLeftPosi () {
    return $filesEl.position().left
  }

  function activeFilePos () {
    var el = $filesEl.find('.active')
    var l = el.position().left
    return l
  }

  function reAdjust () {
    if (widthOfList() + getLeftPosi() > widthOfVisible()) {
      $scrollerRight.fadeIn('fast')
    } else {
      $scrollerRight.fadeOut('fast')
    }

    if (getLeftPosi() < 0) {
      $scrollerLeft.fadeIn('fast')
    } else {
      $scrollerLeft.fadeOut('fast')
      $filesEl.animate({ left: getLeftPosi() + 'px' }, 'slow')
    }
  }

  $scrollerRight.click(function () {
    var delta = (getLeftPosi() - FILE_SCROLL_DELTA)
    $filesEl.animate({ left: delta + 'px' }, 'slow', function () {
      reAdjust()
    })
  })

  $scrollerLeft.click(function () {
    var delta = Math.min((getLeftPosi() + FILE_SCROLL_DELTA), 0)
    $filesEl.animate({ left: delta + 'px' }, 'slow', function () {
      reAdjust()
    })
  })

  // ----------------- resizeable ui ---------------

  var EDITOR_WINDOW_SIZE = 'editorWindowSize'

  var dragging = false
  $('#dragbar').mousedown(function (e) {
    e.preventDefault()
    dragging = true
    var main = $('#righthand-panel')
    var ghostbar = $('<div id="ghostbar">', {
      css: {
        top: main.offset().top,
        left: main.offset().left
      }
    }).prependTo('body')

    $(document).mousemove(function (e) {
      ghostbar.css('left', e.pageX + 2)
    })
  })

  var $body = $('body')

  function setEditorSize (delta) {
    $('#righthand-panel').css('width', delta)
    $('#editor').css('right', delta)
    onResize()
  }

  function getEditorSize () {
    return $('#righthand-panel').width()
  }

  $(document).mouseup(function (e) {
    if (dragging) {
      var delta = $body.width() - e.pageX + 2
      $('#ghostbar').remove()
      $(document).unbind('mousemove')
      dragging = false
      delta = (delta < 50) ? 50 : delta
      setEditorSize(delta)
      config.set(EDITOR_WINDOW_SIZE, delta)
      reAdjust()
    }
  })

  if (config.exists(EDITOR_WINDOW_SIZE)) {
    setEditorSize(config.get(EDITOR_WINDOW_SIZE))
  } else {
    config.set(EDITOR_WINDOW_SIZE, getEditorSize())
  }

  // ----------------- toggle right hand panel -----------------

  var hidingRHP = false
  $('.toggleRHP').click(function () {
    hidingRHP = !hidingRHP
    setEditorSize(hidingRHP ? 0 : config.get(EDITOR_WINDOW_SIZE))
    $('.toggleRHP i').toggleClass('fa-angle-double-right', !hidingRHP)
    $('.toggleRHP i').toggleClass('fa-angle-double-left', hidingRHP)
  })

  // ----------------- editor resize ---------------

  function onResize () {
    editor.resize(document.querySelector('#editorWrap').checked)
    reAdjust()
  }
  window.onresize = onResize
  onResize()

  document.querySelector('#editor').addEventListener('change', onResize)
  document.querySelector('#editorWrap').addEventListener('change', onResize)

  // ----------------- compiler output renderer ----------------------

  $('.asmOutput button').click(function () { $(this).parent().find('pre').toggle() })

  // ----------------- compiler ----------------------

  function handleGithubCall (root, path, cb) {
    return $.getJSON('https://api.github.com/repos/' + root + '/contents/' + path)
      .done(function (data) {
        if ('content' in data) {
          cb(null, base64.decode(data.content))
        } else {
          cb('Content not received')
        }
      })
      .fail(function (xhr, text, err) {
        // NOTE: on some browsers, err equals to '' for certain errors (such as offline browser)
        cb(err || 'Unknown transport error')
      })
  }

  function handleSwarmImport (url, cb) {
    swarmgw.get(url, function (err, content) {
      // retry if this failed and we're connected via RPC
      if (err && !executionContext.isVM()) {
        var web3 = executionContext.web3()
        web3.swarm.download(url, cb)
      } else {
        cb(err, content)
      }
    })
  }

  function handleIPFS (url, cb) {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, 'ipfs/')

    return $.ajax({ type: 'GET', url: 'https://gateway.ipfs.io/' + url })
      .done(function (data) {
        cb(null, data)
      })
      .fail(function (xhr, text, err) {
        // NOTE: on some browsers, err equals to '' for certain errors (such as offline browser)
        cb(err || 'Unknown transport error')
      })
  }

  function handleImportCall (url, cb) {
    if (files.exists(url)) {
      cb(null, files.get(url))
      return
    }

    var handlers = [
      { match: /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/, handler: function (match, cb) { handleGithubCall(match[3], match[4], cb) } },
      { match: /^(bzz[ri]?:\/\/?.*)$/, handler: function (match, cb) { handleSwarmImport(match[1], cb) } },
      { match: /^(ipfs:\/\/?.+)/, handler: function (match, cb) { handleIPFS(match[1], cb) } }
    ]

    var found = false
    handlers.forEach(function (handler) {
      if (found) {
        return
      }

      var match = handler.match.exec(url)
      if (match) {
        found = true

        $('#output').append($('<div/>').append($('<pre/>').text('Loading ' + url + ' ...')))
        handler.handler(match, function (err, content) {
          if (err) {
            cb('Unable to import "' + url + '": ' + err)
            return
          }

          // FIXME: at some point we should invalidate the cache
          files.addReadOnly(url, content)
          cb(null, content)
        })
      }
    })

    if (found) {
      return
    } else if (/^[^:]*:\/\//.exec(url)) {
      cb('Unable to import "' + url + '": Unsupported URL schema')
    } else {
      cb('Unable to import "' + url + '": File not found')
    }
  }

  var executionContext = new ExecutionContext()
  var compiler = new Compiler(handleImportCall)
  var formalVerification = new FormalVerification($('#verificationView'), compiler.event)
  var offsetToLineColumnConverter = new OffsetToLineColumnConverter(compiler.event)

  // ----------------- Debugger -----------------
  var debugAPI = {
    statementMarker: null,
    fullLineMarker: null,
    currentSourceLocation: (lineColumnPos, location) => {
      if (this.statementMarker) editor.removeMarker(this.statementMarker)
      if (this.fullLineMarker) editor.removeMarker(this.fullLineMarker)
      this.statementMarker = null
      this.fullLineMarker = null
      if (lineColumnPos) {
        var source = compiler.lastCompilationResult.data.sourceList[location.file] // auto switch to that tab
        if (currentFile !== source) {
          switchToFile(source)
        }
        this.statementMarker = editor.addMarker(lineColumnPos, 'highlightcode')
        if (lineColumnPos.start.line === lineColumnPos.end.line) {
          this.fullLineMarker = editor.addMarker({
            start: {
              line: lineColumnPos.start.line,
              column: 0
            },
            end: {
              line: lineColumnPos.start.line + 1,
              column: 0
            }
          }, 'highlightcode_fullLine')
        }
      }
    },
    lastCompilationResult: () => {
      return compiler.lastCompilationResult
    },
    offsetToLineColumn: (location, file) => {
      return offsetToLineColumnConverter.offsetToLineColumn(location, file, compiler.lastCompilationResult)
    }
  }
  var transactionDebugger = new Debugger('#debugger', debugAPI, executionContext.event, editor.event)
  transactionDebugger.addProvider('vm', executionContext.vm())
  transactionDebugger.addProvider('injected', executionContext.web3())
  transactionDebugger.addProvider('web3', executionContext.web3())
  transactionDebugger.switchProvider(executionContext.getProvider())

  // ----------------- UniversalDApp -----------------
  var udapp = new UniversalDApp(executionContext, {
    removable: false,
    removable_instances: true
  })

  udapp.event.register('debugRequested', this, function (txResult) {
    startdebugging(txResult.transactionHash)
  })

  function swarmVerifiedPublish (content, expectedHash, cb) {
    swarmgw.put(content, function (err, ret) {
      if (err) {
        cb(err)
      } else if (ret !== expectedHash) {
        cb('Hash mismatch')
      } else {
        cb()
      }
    })
  }

  function publishOnSwarm (contract, cb) {
    // gather list of files to publish
    var sources = []

    sources.push({
      content: contract.metadata,
      hash: contract.metadataHash
    })

    var metadata
    try {
      metadata = JSON.parse(contract.metadata)
    } catch (e) {
      return cb(e)
    }

    if (metadata === undefined) {
      return cb('No metadata')
    }

    Object.keys(metadata.sources).forEach(function (fileName) {
      // find hash
      var hash
      try {
        hash = metadata.sources[fileName].urls[0].match('bzzr://(.+)')[1]
      } catch (e) {
        return cb('Metadata inconsistency')
      }

      sources.push({
        content: files.get(fileName),
        hash: hash
      })
    })

    // publish the list of sources in order, fail if any failed
    async.eachSeries(sources, function (item, cb) {
      swarmVerifiedPublish(item.content, item.hash, cb)
    }, cb)
  }

  udapp.event.register('publishContract', this, function (contract) {
    publishOnSwarm(contract, function (err) {
      if (err) {
        alert('Failed to publish metadata: ' + err)
      } else {
        alert('Metadata published successfully')
      }
    })
  })

  // ----------------- Renderer -----------------
  var transactionContextAPI = {
    getAddress: (cb) => {
      cb(null, $('#txorigin').val())
    },
    getValue: (cb) => {
      try {
        var comp = $('#value').val().split(' ')
        cb(null, executionContext.web3().toWei(comp[0], comp.slice(1).join(' ')))
      } catch (e) {
        cb(e)
      }
    },
    getGasLimit: (cb) => {
      cb(null, $('#gasLimit').val())
    }
  }

  var rendererAPI = {
    error: (file, error) => {
      if (file === currentFile) {
        editor.addAnnotation(error)
      }
    },
    errorClick: (errFile, errLine, errCol) => {
      if (errFile !== currentFile && files.exists(errFile)) {
        switchToFile(errFile)
      }
      editor.gotoLine(errLine, errCol)
    },
    currentCompiledSourceCode: () => {
      if (compiler.lastCompilationResult.source) {
        return compiler.lastCompilationResult.source.sources[compiler.lastCompilationResult.source.target]
      }
      return ''
    },
    resetDapp: (udappContracts, renderOutputModifier) => {
      udapp.reset(udappContracts, transactionContextAPI, renderOutputModifier)
    },
    renderDapp: () => {
      return udapp.render()
    },
    getAccounts: (callback) => {
      udapp.getAccounts(callback)
    }
  }
  var renderer = new Renderer(rendererAPI, formalVerification.event, compiler.event)

  // ----------------- StaticAnalysis -----------------
  var staticAnalysisAPI = {
    renderWarning: (label, warningContainer, type) => {
      return renderer.error(label, warningContainer, type)
    },
    offsetToLineColumn: (location, file) => {
      return offsetToLineColumnConverter.offsetToLineColumn(location, file, compiler.lastCompilationResult)
    }
  }
  var staticanalysis = new StaticAnalysis(staticAnalysisAPI, compiler.event)
  $('#staticanalysisView').append(staticanalysis.render())

  // ----------------- autoCompile -----------------
  var autoCompile = document.querySelector('#autoCompile').checked
  if (config.exists('autoCompile')) {
    autoCompile = config.get('autoCompile')
    $('#autoCompile').checked = autoCompile
  }

  document.querySelector('#autoCompile').addEventListener('change', function () {
    autoCompile = document.querySelector('#autoCompile').checked
    config.set('autoCompile', autoCompile)
  })

  function runCompiler () {
    editorSyncFile()
    if (currentFile) {
      var target = currentFile
      var sources = {}
      sources[target] = files.get(target)
      compiler.compile(sources, target)
    }
  }

  function editorSyncFile () {
    if (currentFile) {
      var input = editor.get(currentFile)
      files.set(currentFile, input)
    }
  }

  var previousInput = ''
  var compileTimeout = null
  var saveTimeout = null

  function editorOnChange () {
    if (!currentFile) {
      return
    }
    var input = editor.get(currentFile)

    // if there's no change, don't do anything
    if (input === previousInput) {
      return
    }
    previousInput = input

    // fire storage update
    // NOTE: save at most once per 5 seconds
    if (saveTimeout) {
      window.clearTimeout(saveTimeout)
    }
    saveTimeout = window.setTimeout(editorSyncFile, 5000)

    // special case: there's nothing else to do
    if (input === '') {
      return
    }

    if (!autoCompile) {
      return
    }

    if (compileTimeout) {
      window.clearTimeout(compileTimeout)
    }
    compileTimeout = window.setTimeout(runCompiler, 300)
  }

  editor.event.register('contentChanged', editorOnChange)
  // in order to save the file when switching
  editor.event.register('sessionSwitched', editorOnChange)

  $('#compile').click(function () {
    runCompiler()
  })

  executionContext.event.register('contextChanged', this, function (context) {
    runCompiler()
  })

  executionContext.event.register('web3EndpointChanged', this, function (context) {
    runCompiler()
  })

  compiler.event.register('loadingCompiler', this, function (url, usingWorker) {
    setVersionText(usingWorker ? '(loading using worker)' : '( Loading... Please, wait a moment. )')
  })

  compiler.event.register('compilerLoaded', this, function (version) {
    previousInput = ''
    setVersionText(version)
    runCompiler()

    if (queryParams.get().endpointurl) {
      executionContext.setEndPointUrl(queryParams.get().endpointurl)
    }
    if (queryParams.get().context) {
      executionContext.setContext(queryParams.get().context)
    }
    if (queryParams.get().debugtx) {
      startdebugging(queryParams.get().debugtx)
    }
  })

  compiler.event.register('compilationStarted', this, function () {
    editor.clearAnnotations()
  })

  function startdebugging (txHash) {
    transactionDebugger.debug(txHash)
    selectTab($('ul#options li.debugView'))
  }

  function setVersionText (text) {
    $('#version').text(text)
  }

  function loadVersion (version) {
    queryParams.update({ version: version })
    var url
    if (version === 'builtin') {
      var location = window.document.location
      location = location.protocol + '//' + location.host + '/' + location.pathname
      if (location.endsWith('index.html')) {
        location = location.substring(0, location.length - 10)
      }
      if (!location.endsWith('/')) {
        location += '/'
      }

      url = location + 'soljson.js'
    } else {
      url = 'https://ethereum.github.io/solc-bin/bin/' + version
    }
    var isFirefox = typeof InstallTrigger !== 'undefined'
    if (document.location.protocol !== 'file:' && Worker !== undefined && isFirefox) {
      // Workers cannot load js on "file:"-URLs and we get a
      // "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
      // resort to non-worker version in that case.
      compiler.loadVersion(true, url)
    } else {
      compiler.loadVersion(false, url)
    }
  }

  // set default
  $('#optimize').attr('checked', (queryParams.get().optimize === 'true'))
  compiler.setOptimize(document.querySelector('#optimize').checked)

  document.querySelector('#optimize').addEventListener('change', function () {
    var optimize = document.querySelector('#optimize').checked
    queryParams.update({ optimize: optimize })
    compiler.setOptimize(optimize)
    runCompiler()
  })

  // ----------------- version selector-------------

  // clear and disable the version selector
  $('option', '#versionSelector').remove()
  $('#versionSelector').attr('disabled', true)

  // load the new version upon change
  $('#versionSelector').change(function () {
    loadVersion($('#versionSelector').val())
  })

  var header = new Option('Click to select new compiler version')
  header.disabled = true
  header.selected = true
  $('#versionSelector').append(header)

  $.getJSON('https://ethereum.github.io/solc-bin/bin/list.json').done(function (data) {
    // populate version dropdown with all available compiler versions (descending order)
    $.each(data.builds.slice().reverse(), function (i, build) {
      $('#versionSelector').append(new Option(build.longVersion, build.path))
    })

    $('#versionSelector').attr('disabled', false)

    // always include the local version
    $('#versionSelector').append(new Option('latest local version', 'builtin'))

    // find latest release
    var selectedVersion = data.releases[data.latestRelease]

    // override with the requested version
    if (queryParams.get().version) {
      selectedVersion = queryParams.get().version
    }

    loadVersion(selectedVersion)
  }).fail(function (xhr, text, err) {
    // loading failed for some reason, fall back to local compiler
    $('#versionSelector').append(new Option('latest local version', 'builtin'))

    loadVersion('builtin')
  })
}

module.exports = {
  'run': run
}
