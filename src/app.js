/* global alert, confirm, prompt, Option, Worker, chrome */
'use strict'

var async = require('async')
var $ = require('jquery')
var base64 = require('js-base64').Base64
var swarmgw = require('swarmgw')
var csjs = require('csjs-inject')

var QueryParams = require('./app/query-params')
var queryParams = new QueryParams()
var GistHandler = require('./app/gist-handler')
var gistHandler = new GistHandler()

var Remixd = require('./lib/remixd')
var Storage = require('./app/files/storage')
var Browserfiles = require('./app/files/browser-files')
var SharedFolder = require('./app/files/shared-folder')
var Config = require('./app/config')
var Editor = require('./app/editor')
var Renderer = require('./app/renderer')
var Compiler = require('./app/compiler')
var ExecutionContext = require('./app/execution-context')
var UniversalDApp = require('./universal-dapp.js')
var Debugger = require('./app/debugger')
var EventManager = require('ethereum-remix').lib.EventManager
var StaticAnalysis = require('./app/staticanalysis/staticAnalysisView')
var OffsetToLineColumnConverter = require('./lib/offsetToLineColumnConverter')
var FilePanel = require('./app/file-panel')
var RighthandPanel = require('./app/righthand-panel')
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
var run = function () {
  var self = this
  this.event = new EventManager()
  var fileStorage = new Storage('sol:')
  var config = new Config(fileStorage)
  var remixd = new Remixd()
  var filesProviders = {}
  filesProviders['browser'] = new Browserfiles(fileStorage)
  filesProviders['localhost'] = new SharedFolder(remixd)

  var tabbedFiles = {} // list of files displayed in the tabs bar

  // return all the files, except the temporary/readonly ones.. package only files from the browser storage.
  function packageFiles (cb) {
    var ret = {}
    var files = filesProviders['browser']
    var filtered = Object.keys(files.list()).filter(function (path) { if (!files.isReadOnly(path)) { return path } })
    async.eachSeries(filtered, function (path, cb) {
      ret[path] = { content: files.get(path) }
      cb()
    }, () => {
      cb(ret)
    })
  }

  function createNonClashingName (path) {
    var counter = ''
    if (path.endsWith('.sol')) path = path.substring(0, path.lastIndexOf('.sol'))
    while (filesProviders['browser'].exists(path + counter + '.sol')) {
      counter = (counter | 0) + 1
    }
    return path + counter + '.sol'
  }

  // Add files received from remote instance (i.e. another browser-solidity)
  function loadFiles (filesSet) {
    for (var f in filesSet) {
      filesProviders['browser'].set(createNonClashingName(f), filesSet[f].content)
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
  if (!loadingFromGist && Object.keys(filesProviders['browser'].list()).length === 0) {
    if (!filesProviders['browser'].set(examples.ballot.name, examples.ballot.content)) {
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
          filesProviders['browser'].set(key, resp[key])
        } else {
          console.log('add to obj', obj, key)
          filesProviders['browser'].get(key, (error, content) => {
            if (error) {
              console.log(error)
            } else {
              obj[key] = content
            }
          })
        }
        done++
        if (done >= count) {
          chrome.storage.sync.set(obj, function () {
            console.log('updated cloud files with: ', obj, this, arguments)
          })
        }
      })
    }

    for (var y in filesProviders['browser'].list()) {
      console.log('checking', y)
      filesProviders['browser'].get(y, (error, content) => {
        if (error) {
          console.log(error)
        } else {
          obj[y] = content
          count++
          check(y)
        }
      })
    }
  }

  window.syncStorage = chromeCloudSync
  chromeCloudSync()

  // ---------------- FilePanel --------------------
  // TODO: All FilePanel related CSS should move into file-panel.js
  // app.js provides file-panel.js with a css selector or a DOM element
  // and file-panel.js adds its elements (including css), see "Editor" above
  var css = csjs`
    .filepanel-container    {
      display     : flex;
      width       : 200px;
    }
  `
  var filepanelContainer = document.querySelector('#filepanel')
  filepanelContainer.className = css['filepanel-container']
  var FilePanelAPI = {
    createName: createNonClashingName,
    switchToFile: switchToFile,
    event: this.event,
    editorFontSize: function (incr) {
      editor.editorFontSize(incr)
    },
    currentFile: function () {
      return config.get('currentFile')
    },
    currentContent: function () {
      return editor.get(config.get('currentFile'))
    },
    setText: function (text) {
      editor.setText(text)
    }
  }
  var filePanel = new FilePanel(FilePanelAPI, filesProviders)
  // TODO this should happen inside file-panel.js
  filepanelContainer.appendChild(filePanel)

  filePanel.events.register('ui-hidden', function changeLayout (isHidden) {
    var value
    if (isHidden) {
      value = -parseInt(window['filepanel'].style.width)
      value = (isNaN(value) ? -window['filepanel'].getBoundingClientRect().width : value)
      window['filepanel'].style.position = 'absolute'
      window['filepanel'].style.left = (value - 5) + 'px'
      window['filepanel'].style.width = -value + 'px'
      window['tabs-bar'].style.left = '45px'
    } else {
      value = -parseInt(window['filepanel'].style.left) + 'px'
      window['filepanel'].style.position = 'static'
      window['filepanel'].style.width = value
      window['filepanel'].style.left = ''
      window['tabs-bar'].style.left = value
    }
  })
  filePanel.events.register('ui-resize', function changeLayout (width) {
    window['filepanel'].style.width = width + 'px'
    window['tabs-bar'].style.left = width + 'px'
  })

  function fileRenamedEvent (oldName, newName, isFolder) {
    // TODO please never use 'window' when it is possible to use a variable
    // that references the DOM node
    [...window.files.querySelectorAll('.file .name')].forEach(function (span) {
      if (span.innerText === oldName) span.innerText = newName
    })
    if (!isFolder) {
      config.set('currentFile', '')
      editor.discard(oldName)
      if (tabbedFiles[oldName]) {
        delete tabbedFiles[oldName]
        tabbedFiles[newName] = newName
      }
      switchToFile(newName)
    } else {
      var newFocus
      for (var k in tabbedFiles) {
        if (k.indexOf(oldName + '/') === 0) {
          var newAbsolutePath = k.replace(oldName, newName)
          tabbedFiles[newAbsolutePath] = newAbsolutePath
          delete tabbedFiles[k]
          if (config.get('currentFile') === k) {
            newFocus = newAbsolutePath
          }
        }
      }
      if (newFocus) {
        switchToFile(newFocus)
      }
    }
    refreshTabs()
  }

  filesProviders['browser'].event.register('fileRenamed', fileRenamedEvent)
  filesProviders['localhost'].event.register('fileRenamed', fileRenamedEvent)

  function fileRemovedEvent (path) {
    if (path === config.get('currentFile')) {
      config.set('currentFile', '')
      switchToNextFile()
    }
    editor.discard(path)
    delete tabbedFiles[path]
    refreshTabs()
  }
  filesProviders['browser'].event.register('fileRemoved', fileRemovedEvent)
  filesProviders['localhost'].event.register('fileRemoved', fileRemovedEvent)

  // ------------------ gist publish --------------

  $('#gist').click(function () {
    if (confirm('Are you sure you want to publish all your files anonymously as a public gist on github.com?')) {
      packageFiles((error, packaged) => {
        if (error) {
          console.log(error)
        } else {
          var description = 'Created using browser-solidity: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://ethereum.github.io/browser-solidity/#version=' + queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&gist='

          $.ajax({
            url: 'https://api.github.com/gists',
            type: 'POST',
            data: JSON.stringify({
              description: description,
              public: true,
              files: packaged
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
    packageFiles((error, packaged) => {
      if (error) {
        console.log(error)
      } else {
        $('<iframe/>', {
          src: target,
          style: 'display:none;',
          load: function () { this.contentWindow.postMessage(['loadFiles', packaged], '*') }
        }).appendTo('body')
      }
    })
  })

  // ----------------- editor ----------------------
  var editor = new Editor(document.getElementById('input'))

  // --------------------Files tabs-----------------------------
  var $filesEl = $('#files')
  var FILE_SCROLL_DELTA = 300

  // Switch tab
  $filesEl.on('click', '.file:not(.active)', function (ev) {
    ev.preventDefault()
    switchToFile($(this).find('.name').text())
    return false
  })

  // Remove current tab
  $filesEl.on('click', '.file .remove', function (ev) {
    ev.preventDefault()
    var name = $(this).parent().find('.name').text()
    delete tabbedFiles[name]
    refreshTabs()
    if (Object.keys(tabbedFiles).length) {
      switchToFile(Object.keys(tabbedFiles)[0])
    } else {
      editor.displayEmptyReadOnlySession()
    }
    return false
  })

  function switchToFile (file) {
    editorSyncFile()
    config.set('currentFile', file)
    refreshTabs(file)
    fileProviderOf(file).get(file, (error, content) => {
      if (error) {
        console.log(error)
      } else {
        if (fileProviderOf(file).isReadOnly(file)) {
          editor.openReadOnly(file, content)
        } else {
          editor.open(file, content)
        }
        self.event.trigger('currentFileChanged', [file, fileProviderOf(file)])
      }
    })
  }

  function switchToNextFile () {
    var fileList = Object.keys(filesProviders['browser'].list())
    if (fileList.length) {
      switchToFile(fileList[0])
    }
  }

  var previouslyOpenedFile = config.get('currentFile')
  if (previouslyOpenedFile) {
    filesProviders['browser'].get(previouslyOpenedFile, (error, content) => {
      if (!error && content) {
        switchToFile(previouslyOpenedFile)
      } else {
        switchToNextFile()
      }
    })
  } else {
    switchToNextFile()
  }

  function fileProviderOf (file) {
    var provider = file.match(/[^/]*/)
    if (provider !== null) {
      return filesProviders[provider[0]]
    }
    return null
  }

  // Display files that have already been selected
  function refreshTabs (newfile) {
    if (newfile) {
      tabbedFiles[newfile] = newfile
    }

    var $filesEl = $('#files')
    $filesEl.find('.file').remove()

    for (var file in tabbedFiles) {
      $filesEl.append($('<li class="file"><span class="name">' + file + '</span><span class="remove"><i class="fa fa-close"></i></span></li>'))
    }

    var currentFileOpen = !!config.get('currentFile')

    if (currentFileOpen) {
      var active = $('#files .file').filter(function () { return $(this).find('.name').text() === config.get('currentFile') })
      active.addClass('active')
    }
    $('#input').toggle(currentFileOpen)
    $('#output').toggle(currentFileOpen)
  }

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

  function widthOfVisible () {
    return document.querySelector('#editor-container').offsetWidth
  }

  function getLeftPosi () {
    return $filesEl.position().left
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

  var compiler = new Compiler(handleImportCall)
  var offsetToLineColumnConverter = new OffsetToLineColumnConverter(compiler.event)

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
      if (file === config.get('currentFile')) {
        editor.addAnnotation(error)
      }
    },
    errorClick: (errFile, errLine, errCol) => {
      if (errFile !== config.get('currentFile') && (filesProviders['browser'].exists(errFile) || filesProviders['localhost'].exists(errFile))) {
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
    },
    getBalance: (address, callback) => {
      udapp.getBalance(address, (error, balance) => {
        if (error) {
          callback(error)
        } else {
          callback(null, executionContext.web3().fromWei(balance, 'ether'))
        }
      })
    }
  }
  var renderer = new Renderer(rendererAPI, compiler.event)

  // ------------------------------------------------------------
  var executionContext = new ExecutionContext()

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

    async.eachSeries(Object.keys(metadata.sources), function (fileName, cb) {
      // find hash
      var hash
      try {
        hash = metadata.sources[fileName].urls[0].match('bzzr://(.+)')[1]
      } catch (e) {
        return cb('Metadata inconsistency')
      }

      fileProviderOf(fileName).get(fileName, (error, content) => {
        if (error) {
          console.log(error)
        } else {
          sources.push({
            content: content,
            hash: hash
          })
        }
        cb()
      })
    }, function () {
      // publish the list of sources in order, fail if any failed
      async.eachSeries(sources, function (item, cb) {
        swarmVerifiedPublish(item.content, item.hash, cb)
      }, cb)
    })
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

  // ---------------- Righthand-panel --------------------
  var rhpAPI = {
    config: config,
    onResize: onResize,
    reAdjust: reAdjust,
    warnCompilerLoading: (msg) => {
      renderer.clear()
      if (msg) {
        renderer.error(msg, $('#output'), {type: 'warning'})
      }
    },
    executionContextChange: (context) => {
      return executionContext.executionContextChange(context)
    },
    executionContextProvider: () => {
      return executionContext.getProvider()
    }
  }
  var rhpEvents = {
    compiler: compiler.event,
    app: self.event,
    udapp: udapp.event
  }
  var righthandPanel = new RighthandPanel(document.body, rhpAPI, rhpEvents, {}) // eslint-disable-line
  // ----------------- editor resize ---------------

  function onResize () {
    editor.resize(document.querySelector('#editorWrap').checked)
    reAdjust()
  }
  window.onresize = onResize
  onResize()

  document.querySelector('#editor').addEventListener('change', onResize)
  document.querySelector('#editorWrap').addEventListener('change', onResize)

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
    var provider = fileProviderOf(url)
    if (provider && provider.exists(url)) {
      return provider.get(url, cb)
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
          filesProviders['browser'].addReadOnly(url, content)
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
        if (config.get('currentFile') !== source) {
          switchToFile(source)
        }
        this.statementMarker = editor.addMarker(lineColumnPos, 'highlightcode')
        
        editor.scrollToLine(lineColumnPos.start.line, true, true, function () {})

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
  var node = document.getElementById('staticanalysisView')
  node.insertBefore(staticanalysis.render(), node.childNodes[0])

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
    if (transactionDebugger.isActive) return

    editorSyncFile()
    var currentFile = config.get('currentFile')
    if (currentFile) {
      var target = currentFile
      var sources = {}
      var provider = fileProviderOf(currentFile)
      if (provider) {
        provider.get(target, (error, content) => {
          if (error) {
            console.log(error)
          } else {
            sources[target] = content
            compiler.compile(sources, target)
          }
        })
      } else {
        console.log('cannot compile ' + currentFile + '. Does not belong to any explorer')
      }
    }
  }

  function editorSyncFile () {
    var currentFile = config.get('currentFile')
    if (currentFile && editor.current()) {
      var input = editor.get(currentFile)
      var provider = fileProviderOf(currentFile)
      if (provider) {
        provider.set(currentFile, input)
      } else {
        console.log('cannot save ' + currentFile + '. Does not belong to any explorer')
      }
    }
  }

  var previousInput = ''
  var compileTimeout = null
  var saveTimeout = null

  function editorOnChange () {
    var currentFile = config.get('currentFile')
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
    setVersionText(usingWorker ? '(loading using worker)' : ' Loading... please, wait a moment! ')
  })

  compiler.event.register('compilerLoaded', this, function (version) {
    previousInput = ''
    setVersionText(version)
    runCompiler()

    if (queryParams.get().context) {
      executionContext.setContext(queryParams.get().context, queryParams.get().endpointurl)
    }

    if (queryParams.get().debugtx) {
      startdebugging(queryParams.get().debugtx)
    }
  })

  compiler.event.register('compilationStarted', this, function () {
    editor.clearAnnotations()
  })

  function startdebugging (txHash) {
    self.event.trigger('debuggingRequested', [])
    transactionDebugger.debug(txHash)
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

  var header = new Option('Select new compiler version')
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
