import React from 'react';
import { compile, helper } from '@remix-project/remix-solidity'
import { CompileTabLogic, parseContracts } from '@remix-ui/solidity-compiler' // eslint-disable-line
import type { ConfigurationSettings } from '@remix-project/remix-lib-ts'

export const CompilerApiMixin = (Base) => class extends Base {
  currentFile: string
  compilationDetails: {
    contractMap: {
      file: string
    } | Record<string, any>,
    contractsDetails: Record<string, any>,
    target?: string
  }
  compileErrors: any
  compileTabLogic: CompileTabLogic
  configurationSettings: ConfigurationSettings

  onCurrentFileChanged: (fileName: string) => void
  // onResetResults: () => void
  onSetWorkspace: (isLocalhost: boolean, workspaceName: string) => void
  onFileRemoved: (path: string) => void
  onNoFileSelected: () => void
  onCompilationFinished: (compilationDetails: { contractMap: { file: string } | Record<string, any>, contractsDetails: Record<string, any> }) => void
  onSessionSwitched: () => void
  onContentChanged: () => void
  onFileClosed: (name: string) => void
  statusChanged: (data: { key: string, title?: string, type?: string }) => void

  initCompilerApi () {
    this.configurationSettings = null

    this._view = {
      warnCompilationSlow: null,
      errorContainer: null,
      contractEl: null
    }

    this.compilationDetails = {
      contractsDetails:{},
      contractMap: {}
    }
    this.data = {
      eventHandlers: {},
      loading: false
    }

    this.compileErrors = {}
    this.compiledFileName = ''
    this.currentFile = ''
  }

  onActivation () {
    this.listenToEvents()
  }

  onDeactivation () {
    this.off('editor', 'contentChanged')

    if (this.data.eventHandlers.onLoadingCompiler) {
      this.compiler.event.unregister('loadingCompiler', this.data.eventHandlers.onLoadingCompiler)
    }

    if (this.data.eventHandlers.onCompilerLoaded) {
      this.compiler.event.unregister('compilerLoaded', this.data.eventHandlers.onCompilerLoaded)
    }

    if (this.data.eventHandlers.onCompilationFinished) {
      this.compiler.event.unregister('compilationFinished', this.data.eventHandlers.onCompilationFinished)
    }

    this.off('filePanel', 'setWorkspace')

    this.off('remixd', 'rootFolderChanged')

    this.off('editor', 'sessionSwitched')

    if (this.data.eventHandlers.onStartingCompilation) {
      this.compileTabLogic.event.off('startingCompilation', this.data.eventHandlers.onStartingCompilation)
    }

    if (this.data.eventHandlers.onRemoveAnnotations) {
      this.compileTabLogic.event.off('removeAnnotations', this.data.eventHandlers.onRemoveAnnotations)
    }

    this.off('fileManager', 'currentFileChanged')

    this.off('fileManager', 'noFileSelected')

    this.off('themeModule', 'themeChanged')

    if (this.data.eventHandlers.onKeyDown) {
      window.document.removeEventListener('keydown', this.data.eventHandlers.onKeyDown)
    }
  }

  resolveContentAndSave (url) {
    return this.call('contentImport', 'resolveAndSave', url)
  }

  runScriptAfterCompilation (fileName: string) {
    this.call('compileAndRun', 'runScriptAfterCompilation', fileName)
  }

  compileWithHardhat (configFile) {
    return this.call('hardhat', 'compile', configFile)
  }

  compileWithTruffle (configFile) {
    return this.call('truffle', 'compile', configFile)
  }

  logToTerminal (content) {
    return this.call('terminal', 'log', content)
  }

  getCompilationResult () {
    return this.compileTabLogic.compiler.state.lastCompilationResult
  }

  getCompilerState () {
    return this.compileTabLogic.getCompilerState()
  }

  /**
   * compile using @arg fileName.
   * The module UI will be updated accordingly to the new compilation result.
   * This function is used by remix-plugin compiler API.
   * @param {string} fileName to compile
   */
  compile (fileName) {
    this.currentFile = fileName
    return this.compileTabLogic.compileFile(fileName)
  }

  compileFile (event) {
    if (event.path.length > 0) {
      this.currentFile = event.path[0]
      this.compileTabLogic.compileFile(event.path[0])
    }
  }

  /**
   * compile using @arg compilationTargets and @arg settings
   * The module UI will *not* be updated, the compilation result is returned
   * This function is used by remix-plugin compiler API.
   * @param {object} map of source files.
   * @param {object} settings {evmVersion, optimize, runs, version, language}
   */
  async compileWithParameters (compilationTargets, settings) {
    const compilerState = this.getCompilerState()
    settings.version = settings.version || compilerState.currentVersion
    const res = await compile(compilationTargets, settings, (url, cb) => this.call('contentImport', 'resolveAndSave', url).then((result) => cb(null, result)).catch((error) => cb(error.message)))
    return res
  }

  // This function is used for passing the compiler configuration to 'remix-tests'
  getCurrentCompilerConfig () {
    const compilerState = this.getCompilerState()
    const compilerDetails: any = {
      currentVersion: compilerState.currentVersion,
      evmVersion: compilerState.evmVersion,
      optimize: compilerState.optimize,
      runs: compilerState.runs
    }
    if (this.data.loading) {
      compilerDetails.currentVersion = this.data.loadingUrl
      compilerDetails.isUrl = true
    }
    return compilerDetails
  }

  /**
   * set the compiler configuration
   * This function is used by remix-plugin compiler API.
   * @param {object} settings {evmVersion, optimize, runs, version, language}
   */
  setCompilerConfig (settings) {
    this.configurationSettings = settings
  }

  fileExists (fileName) {
    return this.call('fileManager', 'exists', fileName)
  }

  writeFile (fileName, content) {
    return this.call('fileManager', 'writeFile', fileName, content)
  }

  readFile (fileName) {
    return this.call('fileManager', 'readFile', fileName)
  }

  open (fileName) {
    return this.call('fileManager', 'open', fileName)
  }

  saveCurrentFile () {
    return this.call('fileManager', 'saveCurrentFile')
  }

  resetResults () {
    this.currentFile = ''
    this.compilationDetails = {
      contractsDetails: {},
      contractMap: {}
    }
    this.statusChanged({ key: 'none' })
    // if (this.onResetResults) this.onResetResults()
  }

  listenToEvents () {
    this.on('editor', 'contentChanged', () => {
      this.statusChanged({ key: 'edited', title: 'the content has changed, needs recompilation', type: 'info' })
      if (this.onContentChanged) this.onContentChanged()
    })

    this.data.eventHandlers.onLoadingCompiler = (url) => {
      this.data.loading = true
      this.data.loadingUrl = url
      this.statusChanged({ key: 'loading', title: 'loading compiler...', type: 'info' })
    }
    this.compiler.event.register('loadingCompiler', this.data.eventHandlers.onLoadingCompiler)

    this.data.eventHandlers.onCompilerLoaded = () => {
      this.data.loading = false
      this.statusChanged({ key: 'none' })
    }
    this.compiler.event.register('compilerLoaded', this.data.eventHandlers.onCompilerLoaded)

    this.data.eventHandlers.onStartingCompilation = () => {
      this.statusChanged({ key: 'loading', title: 'compiling...', type: 'info' })
    }

    this.data.eventHandlers.onRemoveAnnotations = () => {
      this.call('editor', 'clearAnnotations')
    }

    this.on('filePanel', 'setWorkspace', (workspace) => {
      this.resetResults()
      if (this.onSetWorkspace) this.onSetWorkspace(workspace.isLocalhost, workspace.name)
    })

    this.on('fileManager', 'fileRemoved', (path) => {
      if (this.onFileRemoved) this.onFileRemoved(path)
    })

    this.on('remixd', 'rootFolderChanged', () => {
      this.resetResults()
      if (this.onSetWorkspace) this.onSetWorkspace(true, 'localhost')
    })

    this.on('editor', 'sessionSwitched', () => {
      if (this.onSessionSwitched) this.onSessionSwitched()
    })

    this.compileTabLogic.event.on('startingCompilation', this.data.eventHandlers.onStartingCompilation)
    this.compileTabLogic.event.on('removeAnnotations', this.data.eventHandlers.onRemoveAnnotations)

    this.data.eventHandlers.onCurrentFileChanged = (name) => {
      this.currentFile = name
      if (this.onCurrentFileChanged) this.onCurrentFileChanged(name)
    }
    this.on('fileManager', 'currentFileChanged', this.data.eventHandlers.onCurrentFileChanged)

    this.data.eventHandlers.onNoFileSelected = () => {
      this.currentFile = ''
      if (this.onNoFileSelected) this.onNoFileSelected()
    }
    this.on('fileManager', 'noFileSelected', this.data.eventHandlers.onNoFileSelected)

    this.data.eventHandlers.onFileClosed = (name: string) => {
      this.onFileClosed(name)
    }

    this.on('fileManager', 'fileClosed', this.data.eventHandlers.onFileClosed)

    this.data.eventHandlers.onCompilationFinished = async (success, data, source, input, version) => {
      this.compileErrors = data
      if (success) {
        // forwarding the event to the appManager infra
        this.emit('compilationFinished', source.target, source, 'soljson', data, input, version)
        if (data.errors && data.errors.length > 0) {
          this.statusChanged({
            key: data.errors.length,
            title: `compilation finished successful with warning${data.errors.length > 1 ? 's' : ''}`,
            type: 'warning'
          })
        } else this.statusChanged({ key: 'succeed', title: 'compilation successful', type: 'success' })
      } else {
        const count = (data.errors ? data.errors.filter(error => error.severity === 'error').length : 0 + (data.error ? 1 : 0))
        this.statusChanged({ key: count, title: `compilation failed with ${count} error${count > 1 ? 's' : ''}`, type: 'error' })
      }
      // Store the contracts and Update contract Selection
      if (success) {
        this.compilationDetails = await this.visitsContractApi(source, data)
      } else {
        this.compilationDetails = {
          contractMap: {},
          contractsDetails: {},
          target: source.target
        }
      }
      if (this.onCompilationFinished) this.onCompilationFinished(this.compilationDetails)
      // set annotations
      if (data.errors) {
        for (const error of data.errors) {
          let pos = helper.getPositionDetails(error.formattedMessage)
          const file = pos.errFile
          if (file) {
            pos = {
              row: pos.errLine,
              column: pos.errCol,
              text: error.formattedMessage,
              type: error.severity
            }
            await this.call('editor', 'addAnnotation', pos, file)
          }
        }
      }     
    }
    this.compiler.event.register('compilationFinished', this.data.eventHandlers.onCompilationFinished)

    this.data.eventHandlers.onThemeChanged = (theme) => {
      const invert = theme.quality === 'dark' ? 1 : 0
      const img = document.getElementById('swarmLogo')
      if (img) {
        img.style.filter = `invert(${invert})`
      }
    }
    this.on('themeModule', 'themeChanged', this.data.eventHandlers.onThemeChanged)

    // Run the compiler instead of trying to save the website
    this.data.eventHandlers.onKeyDown = async (e) => {
      // ctrl+s or command+s
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.keyCode === 83 && this.currentFile !== '') {
        e.preventDefault()
        if (this.currentFile && (this.currentFile.endsWith('.sol') || this.currentFile.endsWith('.yul'))) {
          if(await this.getAppParameter('hardhat-compilation')) this.compileTabLogic.runCompiler('hardhat')
          else if(await this.getAppParameter('truffle-compilation')) this.compileTabLogic.runCompiler('truffle')
          else this.compileTabLogic.runCompiler(undefined)
        }
      }
    }
    window.document.addEventListener('keydown', this.data.eventHandlers.onKeyDown)
  }

  async visitsContractApi (source, data): Promise<{ contractMap: { file: string } | Record<string, any>, contractsDetails: Record<string, any>, target?: string }> {
    return new Promise((resolve) => {
      if (!data.contracts || (data.contracts && Object.keys(data.contracts).length === 0)) {
        return resolve({
          contractMap: {}, 
          contractsDetails: {},
          target: source.target
        })
      }
      const contractMap = {}
      const contractsDetails = {}
      this.compiler.visitContracts((contract) => {
        contractMap[contract.name] = contract
        contractsDetails[contract.name] = parseContracts(
          contract.name,
          contract.object,
          this.compiler.getSource(contract.file)
        )
      })
      return resolve({
        contractMap, 
        contractsDetails,
        target: source.target
      })
    })
  }
}
