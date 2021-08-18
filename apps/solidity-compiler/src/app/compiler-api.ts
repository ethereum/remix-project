import { compile } from '@remix-project/remix-solidity'
import { CompileTabLogic, parseContracts } from '@remix-ui/solidity-compiler' // eslint-disable-line
import type { ConfigurationSettings } from '@remix-project/remix-lib-ts'

export const CompilerApiMixin = (Base) => class extends Base {
  currentFile: string
  contractMap: {
    file: string
  } | Record<string, any>
  compileErrors: any
  compileTabLogic: CompileTabLogic
  contractsDetails: Record<string, any>

  configurationSettings: ConfigurationSettings

  onCurrentFileChanged: (fileName: string) => void
  onResetResults: () => void
  onSetWorkspace: (workspace: any) => void
  onNoFileSelected: () => void
  onCompilationFinished: (contractsDetails: any, contractMap: any) => void
  onSessionSwitched: () => void
  onContentChanged: () => void

  initCompilerApi () {
    this.configurationSettings = null

    this._view = {
      warnCompilationSlow: null,
      errorContainer: null,
      contractEl: null
    }
    
    this.contractsDetails = {}
    this.data = {
      eventHandlers: {},
      loading: false
    }
<<<<<<< HEAD
=======
    this.compileTabLogic = new CompileTabLogic(this, this.contentImport)
    this.compiler = this.compileTabLogic.compiler
    this.compileTabLogic.init()
>>>>>>> aeaebb6a4 (create solidity web app)

    this.contractMap = {}
    this.contractsDetails = {}

    this.compileErrors = {}
    this.compiledFileName = ''
<<<<<<< HEAD
=======
    this.selectedVersion = ''
>>>>>>> aeaebb6a4 (create solidity web app)
    this.currentFile = ''
  }

  onActivation () {
<<<<<<< HEAD
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

  compileWithHardhat (configFile) {
    return this.call('hardhat', 'compile', configFile)
  }

  logToTerminal (content) {
    return this.call('terminal', 'log', content)
  }
  
=======
    this.call('manager', 'activatePlugin', 'solidity-logic')
    this.listenToEvents()    
  }

  onDeactivation () {
    this.call('manager', 'deactivatePlugin', 'solidity-logic')
  }

  setHardHatCompilation (value) {
    this.hhCompilation = value
  }

  setSelectedVersion (version) {
    this.selectedVersion = version
  }

>>>>>>> aeaebb6a4 (create solidity web app)
  getCompilationResult () {
    return this.compileTabLogic.compiler.state.lastCompilationResult
  }

<<<<<<< HEAD
  getCompilerState () {
    return this.compileTabLogic.getCompilerState()
=======
  addExternalFile (fileName, content) {
    this.fileProvider.addExternal(fileName, content)
>>>>>>> aeaebb6a4 (create solidity web app)
  }

  /**
   * compile using @arg fileName.
   * The module UI will be updated accordingly to the new compilation result.
   * This function is used by remix-plugin compiler API.
   * @param {string} fileName to compile
   */
  compile (fileName) {
<<<<<<< HEAD
    this.currentFile = fileName
=======
>>>>>>> aeaebb6a4 (create solidity web app)
    return this.compileTabLogic.compileFile(fileName)
  }

  compileFile (event) {
    if (event.path.length > 0) {
<<<<<<< HEAD
      this.currentFile = event.path[0]
=======
>>>>>>> aeaebb6a4 (create solidity web app)
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
<<<<<<< HEAD
    const compilerState = this.getCompilerState()
    settings.version = settings.version || compilerState.currentVersion
=======
    settings.version = settings.version || this.selectedVersion
>>>>>>> aeaebb6a4 (create solidity web app)
    const res = await compile(compilationTargets, settings, (url, cb) => this.call('contentImport', 'resolveAndSave', url).then((result) => cb(null, result)).catch((error) => cb(error.message)))
    return res
  }

  // This function is used for passing the compiler configuration to 'remix-tests'
  getCurrentCompilerConfig () {
<<<<<<< HEAD
    const compilerState = this.getCompilerState()
    return {
      currentVersion: compilerState.currentVersion,
      evmVersion: compilerState.evmVersion,
      optimize: compilerState.optimize,
      runs: compilerState.runs
    }
  }

=======
    return {
      currentVersion: this.selectedVersion,
      evmVersion: this.compileTabLogic.evmVersion,
      optimize: this.compileTabLogic.optimize,
      runs: this.compileTabLogic.runs
    }
  }


>>>>>>> aeaebb6a4 (create solidity web app)
  /**
   * set the compiler configuration
   * This function is used by remix-plugin compiler API.
   * @param {object} settings {evmVersion, optimize, runs, version, language}
   */
  setCompilerConfig (settings) {
    this.configurationSettings = settings    
<<<<<<< HEAD
  }  
=======
  }

  getParameters () {
    return {}
  }

  setParameters (params) {}

  getConfiguration (name) {
    const conf = {
      'currentFile': () => this.currentFile,
      'hideWarnings': () => false,
      'autoCompile': () => false,
      'includeNightlies': () => false,
      'optimise': () => false
    }
    return conf[name]()
  }

  setConfiguration (name, value) {}

  getFileManagerMode () {
    return 'browser'
  }
>>>>>>> aeaebb6a4 (create solidity web app)

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

<<<<<<< HEAD
  saveCurrentFile () {
    return this.call('fileManager', 'saveCurrentFile')
  }

=======
>>>>>>> aeaebb6a4 (create solidity web app)
  resetResults () {
    this.currentFile = ''
    this.contractsDetails = {}
    this.emit('statusChanged', { key: 'none' })
<<<<<<< HEAD
    if (this.onResetResults) this.onResetResults()
  }

  listenToEvents () {
    this.on('editor', 'contentChanged', () => {
      this.emit('statusChanged', { key: 'edited', title: 'the content has changed, needs recompilation', type: 'info' })
      if (this.onContentChanged) this.onContentChanged()
    })

=======
    if (this.onResetResults()) this.onResetResults()
  }

  listenToEvents () {
    this.data.eventHandlers.onContentChanged = () => {
      this.emit('statusChanged', { key: 'edited', title: 'the content has changed, needs recompilation', type: 'info' })
    }
    this.on('editor', 'contentChanged', this.data.eventHandlers.onContentChanged)
    
>>>>>>> aeaebb6a4 (create solidity web app)
    this.data.eventHandlers.onLoadingCompiler = () => {
      this.data.loading = true
      this.emit('statusChanged', { key: 'loading', title: 'loading compiler...', type: 'info' })
    }
    this.compiler.event.register('loadingCompiler', this.data.eventHandlers.onLoadingCompiler)

    this.data.eventHandlers.onCompilerLoaded = () => {
      this.data.loading = false
      this.emit('statusChanged', { key: 'none' })
    }
    this.compiler.event.register('compilerLoaded', this.data.eventHandlers.onCompilerLoaded)

    this.data.eventHandlers.onStartingCompilation = () => {
      this.emit('statusChanged', { key: 'loading', title: 'compiling...', type: 'info' })
    }

    this.data.eventHandlers.onRemoveAnnotations = () => {
      this.call('editor', 'clearAnnotations')
    }

    this.on('filePanel', 'setWorkspace', (workspace) => {
      this.resetResults()
<<<<<<< HEAD
      if (this.onSetWorkspace) this.onSetWorkspace(workspace.isLocalhost)
    })

    this.on('remixd', 'rootFolderChanged', () => {
      this.resetResults()
      if (this.onSetWorkspace) this.onSetWorkspace(true)
    })

    this.on('editor', 'sessionSwitched', () => {
      if (this.onSessionSwitched) this.onSessionSwitched()
    })    

=======
      if (this.onSetWorkspace) this.onSetWorkspace(workspace)
    })

>>>>>>> aeaebb6a4 (create solidity web app)
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
    
    this.data.eventHandlers.onCompilationFinished = (success, data, source) => {
      this.compileErrors = data
      if (success) {
        // forwarding the event to the appManager infra
        this.emit('compilationFinished', source.target, source, 'soljson', data)
        if (data.errors && data.errors.length > 0) {
          this.emit('statusChanged', {
            key: data.errors.length,
            title: `compilation finished successful with warning${data.errors.length > 1 ? 's' : ''}`,
            type: 'warning'
          })
        } else this.emit('statusChanged', { key: 'succeed', title: 'compilation successful', type: 'success' })
        // Store the contracts
        this.contractsDetails = {}
        this.compiler.visitContracts((contract) => {
          this.contractsDetails[contract.name] = parseContracts(
            contract.name,
            contract.object,
            this.compiler.getSource(contract.file)
          )
        })
      } else {
<<<<<<< HEAD
        const count = (data.errors ? data.errors.filter(error => error.severity === 'error').length : 0 + (data.error ? 1 : 0))
        this.emit('statusChanged', { key: count, title: `compilation failed with ${count} error${count > 1 ? 's' : ''}`, type: 'error' })
=======
        const count = (data.errors ? data.errors.filter(error => error.severity === 'error').length : 0 + data.error ? 1 : 0)
        this.emit('statusChanged', { key: count, title: `compilation failed with ${count} error${count.length > 1 ? 's' : ''}`, type: 'error' })
>>>>>>> aeaebb6a4 (create solidity web app)
      }
      // Update contract Selection
      this.contractMap = {}
      if (success) this.compiler.visitContracts((contract) => { this.contractMap[contract.name] = contract })
      if (this.onCompilationFinished) this.onCompilationFinished(this.contractsDetails, this.contractMap)
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
<<<<<<< HEAD

    // Run the compiler instead of trying to save the website
    this.data.eventHandlers.onKeyDown = (e) => {
      // ctrl+s or command+s
      if ((e.metaKey || e.ctrlKey) && e.keyCode === 83) {
        e.preventDefault()
        this.compileTabLogic.runCompiler(this.getAppParameter('hardhat-compilation'))
      }
    }
    window.document.addEventListener('keydown', this.data.eventHandlers.onKeyDown)
=======
    
    // Run the compiler instead of trying to save the website
    window.document.addEventListener('keydown', (e) => {
      // ctrl+s or command+s
      if ((e.metaKey || e.ctrlKey) && e.keyCode === 83) {
        e.preventDefault()
        this.compileTabLogic.runCompiler(this.hhCompilation)
      }
    })
>>>>>>> aeaebb6a4 (create solidity web app)
  }
}
