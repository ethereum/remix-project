'use strict'

const solc = require('solc/wrapper')
const solcABI = require('solc/abi')

const webworkify = require('webworkify')

const compilerInput = require('./compiler-input')

const remixLib = require('remix-lib')
const EventManager = remixLib.EventManager

const txHelper = require('./txHelper')

/*
  trigger compilationFinished, compilerLoaded, compilationStarted, compilationDuration
*/
function Compiler (handleImportCall) {
  var self = this
  this.event = new EventManager()

  let compileJSON

  let worker = null

  let currentVersion

  let optimize = false

  let evmVersion = null

  let language = 'Solidity'

  this.setOptimize = function (_optimize) {
    optimize = _optimize
  }

  this.setEvmVersion = function (_evmVersion) {
    evmVersion = _evmVersion
  }

  this.setLanguage = function (_language) {
    language = _language
  }

  let compilationStartTime = null
  this.event.register('compilationFinished', (success, data, source) => {
    if (success && compilationStartTime) {
      this.event.trigger('compilationDuration', [(new Date().getTime()) - compilationStartTime])
    }
    compilationStartTime = null
  })

  this.event.register('compilationStarted', () => {
    compilationStartTime = new Date().getTime()
  })

  const internalCompile = (files, target, missingInputs) => {
    gatherImports(files, target, missingInputs, (error, input) => {
      if (error) {
        this.lastCompilationResult = null
        this.event.trigger('compilationFinished', [false, {'error': { formattedMessage: error, severity: 'error' }}, files])
      } else {
        compileJSON(input)
      }
    })
  }

  const compile = function (files, target) {
    self.event.trigger('compilationStarted', [])
    internalCompile(files, target)
  }
  this.compile = compile

  function setCompileJSON (_compileJSON) {
    compileJSON = _compileJSON
  }
  this.setCompileJSON = setCompileJSON // this is exposed for testing

  function onCompilerLoaded (version) {
    currentVersion = version
    self.event.trigger('compilerLoaded', [version])
  }

  function onInternalCompilerLoaded () {
    if (worker === null) {
      let compiler
      if (typeof (window) === 'undefined') {
        compiler = require('solc')
      } else {
        compiler = solc(window.Module)
      }

      compileJSON = function (source) {
        const missingInputs = []
        const missingInputsCallback = function (path) {
          missingInputs.push(path)
          return { error: 'Deferred import' }
        }

        let result
        try {
          const input = compilerInput(source.sources, {optimize: optimize, evmVersion: evmVersion, language: language, target: source.target})
          result = compiler.compile(input, { import: missingInputsCallback })
          result = JSON.parse(result)
        } catch (exception) {
          result = { error: { formattedMessage: 'Uncaught JavaScript exception:\n' + exception, severity: 'error', mode: 'panic' } }
        }

        compilationFinished(result, missingInputs, source)
      }
      onCompilerLoaded(compiler.version())
    }
  }
  // exposed for use in node
  this.onInternalCompilerLoaded = onInternalCompilerLoaded

  this.lastCompilationResult = {
    data: null,
    source: null
  }

  /**
    * return the contract obj of the given @arg name. Uses last compilation result.
    * return null if not found
    * @param {String} name    - contract name
    * @returns contract obj and associated file: { contract, file } or null
    */
  this.getContract = (name) => {
    if (this.lastCompilationResult.data && this.lastCompilationResult.data.contracts) {
      return txHelper.getContract(name, this.lastCompilationResult.data.contracts)
    }
    return null
  }

  /**
    * call the given @arg cb (function) for all the contracts. Uses last compilation result
    * @param {Function} cb    - callback
    */
  this.visitContracts = (cb) => {
    if (this.lastCompilationResult.data && this.lastCompilationResult.data.contracts) {
      return txHelper.visitContracts(this.lastCompilationResult.data.contracts, cb)
    }
    return null
  }

  /**
    * return the compiled contracts from the last compilation result
    * @return {Object}     - contracts
    */
  this.getContracts = () => {
    if (this.lastCompilationResult.data && this.lastCompilationResult.data.contracts) {
      return this.lastCompilationResult.data.contracts
    }
    return null
  }

   /**
    * return the sources from the last compilation result
    * @param {Object} cb    - map of sources
    */
  this.getSources = () => {
    if (this.lastCompilationResult.source) {
      return this.lastCompilationResult.source.sources
    }
    return null
  }

  /**
    * return the sources @arg fileName from the last compilation result
    * @param {Object} cb    - map of sources
    */
  this.getSource = (fileName) => {
    if (this.lastCompilationResult.source) {
      return this.lastCompilationResult.source.sources[fileName]
    }
    return null
  }

  /**
    * return the source from the last compilation result that has the given index. null if source not found
    * @param {Int} index    - index of the source
    */
  this.getSourceName = (index) => {
    if (this.lastCompilationResult.data && this.lastCompilationResult.data.sources) {
      return Object.keys(this.lastCompilationResult.data.sources)[index]
    }
    return null
  }

  function compilationFinished (data, missingInputs, source) {
    let noFatalErrors = true // ie warnings are ok

    function isValidError (error) {
      // The deferred import is not a real error
      // FIXME: maybe have a better check?
      if (/Deferred import/.exec(error.message)) {
        return false
      }

      return error.severity !== 'warning'
    }

    if (data['error'] !== undefined) {
      // Ignore warnings (and the 'Deferred import' error as those are generated by us as a workaround
      if (isValidError(data['error'])) {
        noFatalErrors = false
      }
    }
    if (data['errors'] !== undefined) {
      data['errors'].forEach(function (err) {
        // Ignore warnings and the 'Deferred import' error as those are generated by us as a workaround
        if (isValidError(err)) {
          noFatalErrors = false
        }
      })
    }

    if (!noFatalErrors) {
      // There are fatal errors - abort here
      self.lastCompilationResult = null
      self.event.trigger('compilationFinished', [false, data, source])
    } else if (missingInputs !== undefined && missingInputs.length > 0) {
      // try compiling again with the new set of inputs

      internalCompile(source.sources, source.target, missingInputs)
    } else {
      data = updateInterface(data)

      self.lastCompilationResult = {
        data: data,
        source: source
      }
      self.event.trigger('compilationFinished', [true, data, source])
    }
  }

  // TODO: needs to be changed to be more node friendly
  this.loadVersion = (usingWorker, url) => {
    console.log('Loading ' + url + ' ' + (usingWorker ? 'with worker' : 'without worker'))
    this.event.trigger('loadingCompiler', [url, usingWorker])

    if (worker !== null) {
      worker.terminate()
      worker = null
    }
    if (usingWorker) {
      loadWorker(url)
    } else {
      loadInternal(url)
    }
  }

  function loadInternal (url) {
    delete window.Module
    // NOTE: workaround some browsers?
    window.Module = undefined

    // Set a safe fallback until the new one is loaded
    setCompileJSON(function (source) {
      compilationFinished({ error: { formattedMessage: 'Compiler not yet loaded.' } })
    })

    const newScript = document.createElement('script')
    newScript.type = 'text/javascript'
    newScript.src = url
    document.getElementsByTagName('head')[0].appendChild(newScript)
    const check = window.setInterval(function () {
      if (!window.Module) {
        return
      }
      window.clearInterval(check)
      onInternalCompilerLoaded()
    }, 200)
  }

  function loadWorker (url) {
    worker = webworkify(require('./compiler-worker.js'))
    const jobs = []
    worker.addEventListener('message', function (msg) {
      const data = msg.data
      switch (data.cmd) {
        case 'versionLoaded':
          onCompilerLoaded(data.data)
          break
        case 'compiled':
          let result
          try {
            result = JSON.parse(data.data)
          } catch (exception) {
            result = { 'error': 'Invalid JSON output from the compiler: ' + exception }
          }
          let sources = {}
          if (data.job in jobs !== undefined) {
            sources = jobs[data.job].sources
            delete jobs[data.job]
          }
          compilationFinished(result, data.missingInputs, sources)
          break
      }
    })
    worker.addEventListener('error', function (msg) {
      compilationFinished({ error: 'Worker error: ' + msg.data })
    })
    compileJSON = function (source) {
      jobs.push({sources: source})
      worker.postMessage({cmd: 'compile', job: jobs.length - 1, input: compilerInput(source.sources,
        {optimize: optimize, evmVersion: evmVersion, language: language, target: source.target})})
    }
    worker.postMessage({cmd: 'loadVersion', data: url})
  }

  function gatherImports (files, target, importHints, cb) {
    importHints = importHints || []

    // FIXME: This will only match imports if the file begins with one.
    //        It should tokenize by lines and check each.
    // eslint-disable-next-line no-useless-escape
    let importRegex = /^\s*import\s*[\'\"]([^\'\"]+)[\'\"];/g

    for (var fileName in files) {
      let match
      while ((match = importRegex.exec(files[fileName].content))) {
        let importFilePath = match[1]
        if (importFilePath.startsWith('./')) {
          const path = /(.*\/).*/.exec(fileName)
          if (path !== null) {
            importFilePath = importFilePath.replace('./', path[1])
          } else {
            importFilePath = importFilePath.slice(2)
          }
        }

        // FIXME: should be using includes or sets, but there's also browser compatibility..
        if (importHints.indexOf(importFilePath) === -1) {
          importHints.push(importFilePath)
        }
      }
    }

    while (importHints.length > 0) {
      let m = importHints.pop()
      if (m in files) {
        continue
      }

      if (handleImportCall) {
        handleImportCall(m, function (err, content) {
          if (err) {
            cb(err)
          } else {
            files[m] = { content }
            gatherImports(files, target, importHints, cb)
          }
        })
      }

      return
    }

    cb(null, { 'sources': files, 'target': target })
  }

  function truncateVersion (version) {
    const tmp = /^(\d+.\d+.\d+)/.exec(version)
    if (tmp) {
      return tmp[1]
    }
    return version
  }

  function updateInterface (data) {
    txHelper.visitContracts(data.contracts, (contract) => {
      if (!contract.object.abi) contract.object.abi = []
      if (language === 'Yul' && contract.object.abi.length === 0) {
        // yul compiler does not return any abi,
        // we default to accept the fallback function (which expect raw data as argument).
        contract.object.abi.push({
          'payable': true,
          'stateMutability': 'payable',
          'type': 'fallback'
        })
      }
      data.contracts[contract.file][contract.name].abi = solcABI.update(truncateVersion(currentVersion), contract.object.abi)
    })
    return data
  }
}

module.exports = Compiler
