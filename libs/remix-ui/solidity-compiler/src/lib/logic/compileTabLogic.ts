import { ICompilerApi } from '@remix-project/remix-lib-ts'
import { getValidLanguage } from '@remix-project/remix-solidity'

const Compiler = require('@remix-project/remix-solidity').Compiler
const EventEmitter = require('events')

declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || []  //eslint-disable-line

export class CompileTabLogic {
  public compiler
  public optimize
  public runs
  public evmVersion: string
  public language: string
  public compilerImport
  public event

  constructor (public api: ICompilerApi, public contentImport) {
    this.event = new EventEmitter()
    this.compiler = new Compiler((url, cb) => api.resolveContentAndSave(url).then((result) => cb(null, result)).catch((error) => cb(error.message)))
  }

  init () {
    this.optimize = this.api.getCompilerParameters().optimize
    this.api.setCompilerParameters({ optimize: this.optimize })
    this.compiler.set('optimize', this.optimize)

    this.runs = this.api.getCompilerParameters().runs
    this.runs = this.runs && this.runs !== 'undefined' ? this.runs : 200
    this.api.setCompilerParameters({ runs: this.runs })
    this.compiler.set('runs', this.runs)

    this.evmVersion = this.api.getCompilerParameters().evmVersion
    if (this.evmVersion === 'undefined' || this.evmVersion === 'null' || !this.evmVersion) {
      this.evmVersion = null
    }
    this.api.setCompilerParameters({ evmVersion: this.evmVersion })
    this.compiler.set('evmVersion', this.evmVersion)

    this.language = getValidLanguage(this.api.getCompilerParameters().language)
    if (this.language != null) {
      this.compiler.set('language', this.language)
    }
  }

  setOptimize (newOptimizeValue) {
    this.optimize = newOptimizeValue
    this.api.setCompilerParameters({ optimize: this.optimize })
    this.compiler.set('optimize', this.optimize)
  }

  setRuns (runs) {
    this.runs = runs
    this.api.setCompilerParameters({ runs: this.runs })
    this.compiler.set('runs', this.runs)
  }

  setEvmVersion (newEvmVersion) {
    this.evmVersion = newEvmVersion
    this.api.setCompilerParameters({ evmVersion: this.evmVersion })
    this.compiler.set('evmVersion', this.evmVersion)
  }

  getCompilerState () {
    return this.compiler.state
  }

  /**
   * Set the compiler to using Solidity or Yul (default to Solidity)
   * @params lang {'Solidity' | 'Yul'} ...
   */
  setLanguage (lang) {
    this.language = lang
    this.api.setCompilerParameters({ language: lang })
    this.compiler.set('language', lang)
  }

  /**
   * Compile a specific file of the file manager
   * @param {string} target the path to the file to compile
   */
  compileFile (target) {
    if (!target) throw new Error('No target provided for compiliation')
    return new Promise((resolve, reject) => {
      this.api.readFile(target).then((content) => {
        const sources = { [target]: { content } }
        this.event.emit('removeAnnotations')
        this.event.emit('startingCompilation')
        // setTimeout fix the animation on chrome... (animation triggered by 'staringCompilation')
        setTimeout(() => { this.compiler.compile(sources, target); resolve(true) }, 100)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  async isHardhatProject () {
    if (this.api.getFileManagerMode() === 'localhost') {
      return await this.api.fileExists('hardhat.config.js')
    } else return false
  }

  runCompiler (hhCompilation) {
    try {
      if (this.api.getFileManagerMode() === 'localhost' && hhCompilation) {
        const { currentVersion, optimize, runs } = this.compiler.state
        if (currentVersion) {
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
          this.api.writeFile(configFilePath, fileContent)
          _paq.push(['trackEvent', 'compiler', 'compileWithHardhat'])
          this.api.compileWithHardhat(configFilePath).then((result) => {
            this.api.logToTerminal({ type: 'info', value: result })
          }).catch((error) => {
            this.api.logToTerminal({ type: 'error', value: error })
          })
        }
      }
      // TODO readd saving current file
      this.api.saveCurrentFile()
      var currentFile = this.api.currentFile
      return this.compileFile(currentFile)
    } catch (err) {
      console.error(err)
    }
  }
}
