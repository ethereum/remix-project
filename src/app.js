/* global alert, confirm, prompt, Option, Worker, chrome */
'use strict'

var $ = require('jquery')
var base64 = require('js-base64').Base64

var QueryParams = require('./app/query-params')
var queryParams = new QueryParams()
var GistHandler = require('./app/gist-handler')
var gistHandler = new GistHandler()

var Storage = require('./app/storage')
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
  var config = new Config(storage)

  // Add files received from remote instance (i.e. another browser-solidity)
  function loadFiles (files) {
    for (var f in files) {
      storage.loadFile(f, files[f].content)
    }
    // Set the first file as current tab
    editor.setCacheFile(Object.keys(files)[0])
    updateFiles()
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
          storage.set(key, resp[key])
          updateFiles()
        } else {
          console.log('add to obj', obj, key)
          obj[key] = storage.get(key)
        }
        done++
        if (done >= count) {
          chrome.storage.sync.set(obj, function () {
            console.log('updated cloud files with: ', obj, this, arguments)
          })
        }
      })
    }

    for (var y in storage.keys()) {
      console.log('checking', y)
      obj[y] = storage.get(y)
      count++
      check(y)
    }
  }

  window.syncStorage = chromeCloudSync
  chromeCloudSync()

  // ----------------- editor ----------------------

  var editor = new Editor(loadingFromGist, storage)

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
      var files = editor.packageFiles()
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
    var files = editor.packageFiles()
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
    editor.newFile()
    updateFiles()

    $filesEl.animate({ left: Math.max((0 - activeFilePos() + (FILE_SCROLL_DELTA / 2)), 0) + 'px' }, 'slow', function () {
      reAdjust()
    })
  })

  // ----------------- file upload -------------

  $('.inputFile').on('change', function () {
    var fileList = $('input.inputFile')[0].files
    for (var i = 0; i < fileList.length; i++) {
      var name = fileList[i].name
      if (!editor.hasFile(name) || confirm('The file ' + name + ' already exists! Would you like to overwrite it?')) {
        editor.uploadFile(fileList[i], updateFiles)
      }
    }

    $filesEl.animate({ left: Math.max((0 - activeFilePos() + (FILE_SCROLL_DELTA / 2)), 0) + 'px' }, 'slow', function () {
      reAdjust()
    })
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
          editor.hasFile(newName)
            ? 'Are you sure you want to overwrite: ' + newName + ' with ' + originalName + '?'
            : 'Are you sure you want to rename: ' + originalName + ' to ' + newName + '?')) {
        storage.rename(originalName, newName)
        editor.renameSession(originalName, newName)
        editor.setCacheFile(newName)
      }

      updateFiles()
      return false
    }

    return false
  })

  // Remove current tab
  $filesEl.on('click', '.file .remove', function (ev) {
    ev.preventDefault()
    var name = $(this).parent().find('.name').text()

    if (confirm('Are you sure you want to remove: ' + name + ' from local storage?')) {
      storage.remove(name)
      editor.removeSession(name)
      editor.setNextFile(name)
      updateFiles()
    }
    return false
  })

  function switchToFile (file) {
    editor.setCacheFile(file)
    updateFiles()
  }

  // Synchronise tab list with file names known to the editor
  function updateFiles () {
    var $filesEl = $('#files')
    var files = editor.getFiles()

    $filesEl.find('.file').remove()
    $('#output').empty()

    for (var f in files) {
      var name = files[f]
      $filesEl.append($('<li class="file"><span class="name">' + name + '</span><span class="remove"><i class="fa fa-close"></i></span></li>'))
    }

    if (editor.cacheFileIsPresent()) {
      var currentFileName = editor.getCacheFile()
      var active = $('#files .file').filter(function () { return $(this).find('.name').text() === currentFileName })
      active.addClass('active')
      editor.resetSession()
    }
    $('#input').toggle(editor.cacheFileIsPresent())
    $('#output').toggle(editor.cacheFileIsPresent())
    reAdjust()
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

  updateFiles()

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
    editor.resize()
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
    $('#output').append($('<div/>').append($('<pre/>').text('Loading github.com/' + root + '/' + path + ' ...')))
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

  // FIXME: at some point we should invalidate the cache
  var cachedRemoteFiles = {}

  function handleImportCall (url, cb) {
    var githubMatch
    if (editor.hasFile(url)) {
      cb(null, editor.getFile(url))
    } else if (url in cachedRemoteFiles) {
      cb(null, cachedRemoteFiles[url])
    } else if ((githubMatch = /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/.exec(url))) {
      handleGithubCall(githubMatch[3], githubMatch[4], function (err, content) {
        if (err) {
          cb('Unable to import "' + url + '": ' + err)
          return
        }

        cachedRemoteFiles[url] = content
        cb(null, content)
      })
    } else if (/^[^:]*:\/\//.exec(url)) {
      cb('Unable to import "' + url + '": Unsupported URL')
    } else {
      cb('Unable to import "' + url + '": File not found')
    }
  }

  var executionContext = new ExecutionContext()
  var compiler = new Compiler(handleImportCall)
  var formalVerification = new FormalVerification($('#verificationView'), compiler.event)

  var offsetToLineColumnConverter = new OffsetToLineColumnConverter(compiler.event)

  var transactionDebugger = new Debugger('#debugger', editor, compiler, executionContext.event, switchToFile, offsetToLineColumnConverter)
  transactionDebugger.addProvider('vm', executionContext.vm())
  transactionDebugger.switchProvider('vm')
  transactionDebugger.addProvider('injected', executionContext.web3())
  transactionDebugger.addProvider('web3', executionContext.web3())

  var udapp = new UniversalDApp(executionContext, {
    removable: false,
    removable_instances: true
  }, transactionDebugger)

  udapp.event.register('debugRequested', this, function (txResult) {
    startdebugging(txResult.transactionHash)
  })

  var renderer = new Renderer(editor, updateFiles, udapp, executionContext, formalVerification.event, compiler.event) // eslint-disable-line

  var staticanalysis = new StaticAnalysis(compiler.event, renderer, editor, offsetToLineColumnConverter)
  $('#staticanalysisView').append(staticanalysis.render())

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
    var files = {}
    var target = editor.getCacheFile()

    files[target] = editor.getValue()

    compiler.compile(files, target)
  }

  var previousInput = ''
  var compileTimeout = null
  var saveTimeout = null

  function editorOnChange () {
    var input = editor.getValue()

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
    saveTimeout = window.setTimeout(function () {
      var input = editor.getValue()
      editor.setCacheFileContent(input)
    }, 5000)

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

  editor.onChangeSetup(editorOnChange)

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
    setVersionText(usingWorker ? '(loading using worker)' : '(loading)')
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
