import * as packageJson from '../../../../../../package.json'
import { Plugin } from '@remixproject/engine'
const EventEmitter = require('events')
var Compiler = require('@remix-project/remix-solidity').Compiler

const profile = {
  name: 'solidity-logic',
  displayName: 'Solidity compiler logic',
  description: 'Compile solidity contracts - Logic',
  version: packageJson.version
}

class CompileTab extends Plugin {
  constructor (queryParams, fileManager, editor, config, fileProvider, contentImport) {
    super(profile)
    this.event = new EventEmitter()
    this.queryParams = queryParams
    this.compilerImport = contentImport
    this.compiler = new Compiler((url, cb) => this.compilerImport.resolveAndSave(url).then((result) => cb(null, result)).catch((error) => cb(error.message)))
    this.fileManager = fileManager
    this.editor = editor
    this.config = config
    this.fileProvider = fileProvider
  }

  init () {
    this.optimize = this.queryParams.get().optimize
    this.optimize = this.optimize === 'true'
    this.queryParams.update({ optimize: this.optimize })
    this.compiler.set('optimize', this.optimize)

    this.runs = this.queryParams.get().runs
    this.runs = this.runs || 200
    this.queryParams.update({ runs: this.runs })
    this.compiler.set('runs', this.runs)

    this.evmVersion = this.queryParams.get().evmVersion
    if (this.evmVersion === 'undefined' || this.evmVersion === 'null' || !this.evmVersion) {
      this.evmVersion = null
    }
    this.queryParams.update({ evmVersion: this.evmVersion })
    this.compiler.set('evmVersion', this.evmVersion)
  }

  setOptimize (newOptimizeValue) {
    this.optimize = newOptimizeValue
    this.queryParams.update({ optimize: this.optimize })
    this.compiler.set('optimize', this.optimize)
  }

  setRuns (runs) {
    this.runs = runs
    this.queryParams.update({ runs: this.runs })
    this.compiler.set('runs', this.runs)
  }

  setEvmVersion (newEvmVersion) {
    this.evmVersion = newEvmVersion
    this.queryParams.update({ evmVersion: this.evmVersion })
    this.compiler.set('evmVersion', this.evmVersion)
  }

  /**
   * Set the compiler to using Solidity or Yul (default to Solidity)
   * @params lang {'Solidity' | 'Yul'} ...
   */
  setLanguage (lang) {
    this.compiler.set('language', lang)
  }

  /**
   * Compile a specific file of the file manager
   * @param {string} target the path to the file to compile
   */
  compileFile (target) {
    if (!target) throw new Error('No target provided for compiliation')
    const provider = this.fileManager.fileProviderOf(target)
    if (!provider) throw new Error(`cannot compile ${target}. Does not belong to any explorer`)
    return new Promise((resolve, reject) => {
      provider.get(target, (error, content) => {
        if (error) return reject(error)
        const sources = { [target]: { content } }
        this.event.emit('startingCompilation')
        // setTimeout fix the animation on chrome... (animation triggered by 'staringCompilation')
        setTimeout(() => { this.compiler.compile(sources, target); resolve() }, 100)
      })
    })
  }

  async isHardhatProject () {
    if (this.fileManager.mode === 'localhost') {
      return await this.fileManager.exists('hardhat.config.js')
    } else return false
  }

  runCompiler (hhCompilation) {
    try {
      if (this.fileManager.mode === 'localhost' && hhCompilation) {
        const { currentVersion, optimize, runs } = this.compiler.state
        const fileContent = `module.exports = {
          solidity: '${currentVersion.substring(0, currentVersion.indexOf('+commit'))}',
          settings: {
            optimizer: {
              enabled: ${optimize},
              runs: ${runs}
            }
          }
        }
        `
        const configFilePath = 'remix-compiler.config.js'
        this.fileManager.setFileContent(configFilePath, fileContent)
        this.call('hardhat', 'compile', configFilePath).then((result) => {
          this.emit('hardhatCompilationFinished', result)
        }).catch((error) => {
          this.emit('hardhatCompilationFinished', error)
        })
      }
      this.fileManager.saveCurrentFile()
      this.call('editor', 'clearAnnotations')
      var currentFile = this.config.get('currentFile')
      return this.compileFile(currentFile)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = CompileTab
