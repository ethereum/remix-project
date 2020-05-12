
const yo = require('yo-yo')
const minixhr = require('minixhr')
const helper = require('../../../lib/helper')
const addTooltip = require('../../ui/tooltip')
const semver = require('semver')
const modalDialogCustom = require('../../ui/modal-dialog-custom')
const css = require('../styles/compile-tab-styles')
import { canUseWorker } from '../../compiler/compiler-utils'

class CompilerContainer {

  constructor (compileTabLogic, editor, config, queryParams) {
    this._view = {}
    this.compileTabLogic = compileTabLogic
    this.editor = editor
    this.config = config
    this.queryParams = queryParams

    this.data = {
      hideWarnings: config.get('hideWarnings') || false,
      autoCompile: config.get('autoCompile'),
      compileTimeout: null,
      timeout: 300,
      allversions: null,
      selectedVersion: null,
      defaultVersion: 'soljson-v0.6.6+commit.6c089d02.js', // this default version is defined: in makeMockCompiler (for browser test) and in package.json (downloadsolc_root) for the builtin compiler
      baseurl: 'https://solc-bin.ethereum.org/bin'
    }
  }

  /**
   * Update the compilation button with the name of the current file
   */
  set currentFile (name = '') {
    if (name && name !== '') {
      this._setCompilerVersionFromPragma(name)
    }
    if (!this._view.compilationButton) return
    const button = this.compilationButton(name.split('/').pop())
    this._disableCompileBtn(!name || (name && !this.isSolFileSelected(name)))
    yo.update(this._view.compilationButton, button)
  }

  isSolFileSelected (currentFile = '') {
    if (!currentFile) currentFile = this.config.get('currentFile')
    if (!currentFile) return false
    const extention = currentFile.substr(currentFile.length - 3, currentFile.length)
    return extention.toLowerCase() === 'sol' || extention.toLowerCase() === 'yul'
  }

  deactivate () {
    // deactivate editor listeners
    this.editor.event.unregister('contentChanged')
    this.editor.event.unregister('sessionSwitched')
  }

  activate () {
    this.currentFile = this.config.get('currentFile')
    this.listenToEvents()
  }

  listenToEvents () {
    this.editor.event.register('sessionSwitched', () => {
      if (!this._view.compileIcon) return
      this.scheduleCompilation()
    })

    this.compileTabLogic.event.on('startingCompilation', () => {
      if (!this._view.compileIcon) return
      this._view.compileIcon.setAttribute('title', 'compiling...')
      this._view.compileIcon.classList.remove(`${css.bouncingIcon}`)
      this._view.compileIcon.classList.add(`${css.spinningIcon}`)
    })

    this.compileTabLogic.compiler.event.register('compilationDuration', (speed) => {
      if (!this._view.warnCompilationSlow) return
      if (speed > 1000) {
        const msg = `Last compilation took ${speed}ms. We suggest to turn off autocompilation.`
        this._view.warnCompilationSlow.setAttribute('title', msg)
        this._view.warnCompilationSlow.style.visibility = 'visible'
      } else {
        this._view.warnCompilationSlow.style.visibility = 'hidden'
      }
    })

    this.editor.event.register('contentChanged', () => {
      if (!this._view.compileIcon) return
      this.scheduleCompilation()
      this._view.compileIcon.classList.add(`${css.bouncingIcon}`) // @TODO: compileView tab
    })

    this.compileTabLogic.compiler.event.register('loadingCompiler', () => {
      if (!this._view.compileIcon) return
      this._disableCompileBtn(true)
      this._view.compileIcon.setAttribute('title', 'compiler is loading, please wait a few moments.')
      this._view.compileIcon.classList.add(`${css.spinningIcon}`)
      this._view.warnCompilationSlow.style.visibility = 'hidden'
      this._updateLanguageSelector()
    })

    this.compileTabLogic.compiler.event.register('compilerLoaded', () => {
      if (!this._view.compileIcon) return
      this._disableCompileBtn(false)
      this._view.compileIcon.setAttribute('title', '')
      this._view.compileIcon.classList.remove(`${css.spinningIcon}`)
      if (this.data.autoCompile) this.compileIfAutoCompileOn()
    })

    this.compileTabLogic.compiler.event.register('compilationFinished', (success, data, source) => {
      if (!this._view.compileIcon) return
      this._view.compileIcon.setAttribute('title', 'idle')
      this._view.compileIcon.classList.remove(`${css.spinningIcon}`)
      this._view.compileIcon.classList.remove(`${css.bouncingIcon}`)
    })
  }

  /**************
   * SUBCOMPONENT
   */
  compilationButton (name = '') {
    const displayed = name || '<no file selected>'
    const disabled = name && this.isSolFileSelected() ? '' : 'disabled'
    return yo`
      <button id="compileBtn" data-id="compilerContainerCompileBtn" class="btn btn-primary btn-block ${disabled} mt-3" title="Compile" onclick="${this.compile.bind(this)}">
        <span>${this._view.compileIcon} Compile ${displayed}</span>
      </button>
    `
  }

  _disableCompileBtn (shouldDisable) {
    let btn = document.getElementById('compileBtn')
    if (!btn) return
    if (shouldDisable) {
      btn.classList.add('disabled')
    } else if (this.isSolFileSelected()) {
      btn.classList.remove('disabled')
    }
  }

  // Load solc compiler version according to pragma in contract file
  _setCompilerVersionFromPragma (filename) {
    if (!this.data.allversions) return
    this.compileTabLogic.fileManager.getFile(filename).then(data => {
      const pragmaArr = data.match(/(pragma solidity (.+?);)/g)
      if (pragmaArr && pragmaArr.length === 1) {
        const pragmaStr = pragmaArr[0].replace('pragma solidity', '').trim()
        const pragma = pragmaStr.substring(0, pragmaStr.length - 1)
        const releasedVersions = this.data.allversions.filter(obj => !obj.prerelease).map(obj => obj.version)
        const allVersions = this.data.allversions.map(obj => this._retrieveVersion(obj.version))
        const currentCompilerName = this._retrieveVersion(this._view.versionSelector.selectedOptions[0].label)
        // contains only numbers part, for example '0.4.22'
        const pureVersion = this._retrieveVersion()
        // is nightly build newer than the last release
        const isNewestNightly = currentCompilerName.includes('nightly') && semver.gt(pureVersion, releasedVersions[0])
        // checking if the selected version is in the pragma range
        const isInRange = semver.satisfies(pureVersion, pragma)
        // checking if the selected version is from official compilers list(excluding custom versions) and in range or greater
        const isOfficial = allVersions.includes(currentCompilerName)
        if (isOfficial && (!isInRange && !isNewestNightly)) {
          const compilerToLoad = semver.maxSatisfying(releasedVersions, pragma)
          const compilerPath = this.data.allversions.filter(obj => !obj.prerelease && obj.version === compilerToLoad)[0].path
          if (this.data.selectedVersion !== compilerPath) {
            this.data.selectedVersion = compilerPath
            this._updateVersionSelector()
          }
        }
      }
    })
  }

  _retrieveVersion (version) {
    if (!version) version = this._view.versionSelector.value
    return semver.coerce(version) ? semver.coerce(version).version : ''
  }

  render () {
    this.compileTabLogic.compiler.event.register('compilerLoaded', (version) => this.setVersionText(version))
    this.fetchAllVersion((allversions, selectedVersion) => {
      this.data.allversions = allversions
      this.data.selectedVersion = selectedVersion
      if (this._view.versionSelector) this._updateVersionSelector()
    })

    this._view.warnCompilationSlow = yo`<i title="Compilation Slow" style="visibility:hidden" class="${css.warnCompilationSlow} fas fa-exclamation-triangle" aria-hidden="true"></i>`
    this._view.compileIcon = yo`<i class="fas fa-sync ${css.icon}" aria-hidden="true"></i>`
    this._view.autoCompile = yo`<input class="${css.autocompile} custom-control-input" onchange=${this.updateAutoCompile.bind(this)} data-id="compilerContainerAutoCompile" id="autoCompile" type="checkbox" title="Auto compile">`
    this._view.hideWarningsBox = yo`<input class="${css.autocompile} custom-control-input" onchange=${this.hideWarnings.bind(this)} id="hideWarningsBox" type="checkbox" title="Hide warnings">`
    if (this.data.autoCompile) this._view.autoCompile.setAttribute('checked', '')
    if (this.data.hideWarnings) this._view.hideWarningsBox.setAttribute('checked', '')

    this._view.optimize = yo`<input onchange=${this.onchangeOptimize.bind(this)} class="custom-control-input" id="optimize" type="checkbox">`
    if (this.compileTabLogic.optimize) this._view.optimize.setAttribute('checked', '')

    this._view.versionSelector = yo`
      <select onchange="${this.onchangeLoadVersion.bind(this)}" class="custom-select" id="versionSelector" disabled>
        <option disabled selected>${this.data.defaultVersion}</option>
      </select>`
    this._view.languageSelector = yo`
      <select onchange="${this.onchangeLanguage.bind(this)}" class="custom-select" id="compilierLanguageSelector" title="Available since v0.5.7">
        <option>Solidity</option>
        <option>Yul</option>
      </select>`
    this._view.version = yo`<span id="version"></span>`

    this._view.evmVersionSelector = yo`
      <select onchange="${this.onchangeEvmVersion.bind(this)}" class="custom-select" id="evmVersionSelector">
        <option value="default">compiler default</option>
        <option>istanbul</option>
        <option>petersburg</option>
        <option>constantinople</option>
        <option>byzantium</option>
        <option>spuriousDragon</option>
        <option>tangerineWhistle</option>
        <option>homestead</option>
      </select>`
    if (this.compileTabLogic.evmVersion) {
      let s = this._view.evmVersionSelector
      let i
      for (i = 0; i < s.options.length; i++) {
        if (s.options[i].value === this.compileTabLogic.evmVersion) {
          break
        }
      }
      if (i === s.options.length) { // invalid evmVersion from queryParams
        s.selectedIndex = 0 // compiler default
        this.onchangeEvmVersion()
      } else {
        s.selectedIndex = i
      }
    }

    this._view.compilationButton = this.compilationButton()

    this._view.includeNightlies = yo`
      <input class="mr-2 custom-control-input" id="nightlies" type="checkbox" onchange=${() => this._updateVersionSelector()}>
    `
    this._view.compileContainer = yo`
      <section>
        <!-- Select Compiler Version -->
        <article>
          <header class="${css.compilerSection} border-bottom">
            <div class="mb-2">
              <label class="${css.compilerLabel} form-check-label" for="versionSelector">
                Compiler
                <button class="far fa-plus-square border-0 p-0 mx-2 btn-sm" onclick="${(e) => this.promtCompiler(e)}" title="Add a custom compiler with URL"></button>
              </label>
              ${this._view.versionSelector}
            </div>
            <div class="mb-2 ${css.nightlyBuilds} custom-control custom-checkbox">
              ${this._view.includeNightlies}
              <label for="nightlies" class="form-check-label custom-control-label">Include nightly builds</label>
            </div>
            <div class="mb-2">
              <label class="${css.compilerLabel} form-check-label" for="compilierLanguageSelector">Language</label>
              ${this._view.languageSelector}
            </div>
            <div class="mb-2">
              <label class="${css.compilerLabel} form-check-label" for="evmVersionSelector">EVM Version</label>
              ${this._view.evmVersionSelector}
            </div>
            <div class="mt-3">
              <p class="mt-2 ${css.compilerLabel}">Compiler Configuration</p>
              <div class="mt-2 ${css.compilerConfig} custom-control custom-checkbox">
                ${this._view.autoCompile}
                <label class="form-check-label custom-control-label" for="autoCompile">Auto compile</label>
              </div>
              <div class="mt-2 ${css.compilerConfig} custom-control custom-checkbox">
                ${this._view.optimize}
                <label class="form-check-label custom-control-label" for="optimize">Enable optimization</label>
              </div>
              <div class="mt-2 ${css.compilerConfig} custom-control custom-checkbox">
                ${this._view.hideWarningsBox}
                <label class="form-check-label custom-control-label" for="hideWarningsBox">Hide warnings</label>
              </div>
            </div>
            ${this._view.compilationButton}
          </header>
        </article>
        <!-- Config -->
      </section>`

    return this._view.compileContainer
  }

  promtCompiler () {
    modalDialogCustom.prompt(
      'Add a custom compiler',
      'URL',
      '',
      (url) => this.addCustomCompiler(url)
    )
  }

  addCustomCompiler (url) {
    this.data.selectedVersion = this._view.versionSelector.value
    this._updateVersionSelector(url)
  }

  updateAutoCompile (event) {
    this.config.set('autoCompile', this._view.autoCompile.checked)
  }

  compile (event) {
    const currentFile = this.config.get('currentFile')
    if (!this.isSolFileSelected()) return

    this._setCompilerVersionFromPragma(currentFile)
    this.compileTabLogic.runCompiler()
  }

  compileIfAutoCompileOn () {
    if (this.config.get('autoCompile')) {
      this.compile()
    }
  }

  hideWarnings (event) {
    this.config.set('hideWarnings', this._view.hideWarningsBox.checked)
    this.compileIfAutoCompileOn()
  }

  onchangeOptimize () {
    this.compileTabLogic.setOptimize(!!this._view.optimize.checked)
    this.compileIfAutoCompileOn()
  }

  onchangeLanguage (event) {
    this.compileTabLogic.setLanguage(event.target.value)
    this.compileIfAutoCompileOn()
  }

  onchangeEvmVersion (_) {
    let s = this._view.evmVersionSelector
    let v = s.value
    if (v === 'default') {
      v = null
    }
    this.compileTabLogic.setEvmVersion(v)
    this.compileIfAutoCompileOn()
  }

  onchangeLoadVersion (event) {
    this.data.selectedVersion = this._view.versionSelector.value
    this._updateVersionSelector()
    this._updateLanguageSelector()
  }

  _shouldBeAdded (version) {
    return !version.includes('nightly') ||
           (version.includes('nightly') && this._view.includeNightlies.checked)
  }

  _updateVersionSelector (customUrl = '') {
    // update selectedversion of previous one got filtered out
    if (!this.data.selectedVersion || !this._shouldBeAdded(this.data.selectedVersion)) {
      this.data.selectedVersion = this.data.defaultVersion
    }
    this._view.versionSelector.innerHTML = ''
    this.data.allversions.forEach(build => {
      const option = build.path === this.data.selectedVersion
        ? yo`<option value="${build.path}" selected>${build.longVersion}</option>`
        : yo`<option value="${build.path}">${build.longVersion}</option>`

      if (this._shouldBeAdded(option.innerText)) {
        this._view.versionSelector.appendChild(option)
      }
    })
    this._view.versionSelector.removeAttribute('disabled')
    this.queryParams.update({ version: this.data.selectedVersion })
    let url
    if (customUrl !== '') {
      this.data.selectedVersion = customUrl
      this._view.versionSelector.appendChild(yo`<option value="${customUrl}" selected>custom</option>`)
      url = customUrl
    } else if (this.data.selectedVersion === 'builtin') {
      let location = window.document.location
      location = `${location.protocol}//${location.host}/${location.pathname}`
      if (location.endsWith('index.html')) location = location.substring(0, location.length - 10)
      if (!location.endsWith('/')) location += '/'
      url = location + 'soljson.js'
    } else {
      if (this.data.selectedVersion.indexOf('soljson') !== 0 || helper.checkSpecialChars(this.data.selectedVersion)) {
        return console.log('loading ' + this.data.selectedVersion + ' not allowed')
      }
      url = `${this.data.baseurl}/${this.data.selectedVersion}`
    }

    // Workers cannot load js on "file:"-URLs and we get a
    // "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
    // resort to non-worker version in that case.
    if (canUseWorker(this.data.selectedVersion)) {
      this.compileTabLogic.compiler.loadVersion(true, url)
      this.setVersionText('(loading using worker)')
    } else {
      this.compileTabLogic.compiler.loadVersion(false, url)
      this.setVersionText('(loading)')
    }
  }

  _updateLanguageSelector () {
    // This is the first version when Yul is available
    if (!semver.valid(this._retrieveVersion()) || semver.lt(this._retrieveVersion(), 'v0.5.7+commit.6da8b019.js')) {
      this._view.languageSelector.setAttribute('disabled', '')
      this._view.languageSelector.value = 'Solidity'
      this.compileTabLogic.setLanguage('Solidity')
    } else {
      this._view.languageSelector.removeAttribute('disabled')
    }
  }

  setVersionText (text) {
    if (this._view.version) this._view.version.innerText = text
  }

  fetchAllVersion (callback) {
    minixhr(`${this.data.baseurl}/list.json`, (json, event) => {
      // @TODO: optimise and cache results to improve app loading times #2461
      var allversions, selectedVersion
      if (event.type !== 'error') {
        try {
          const data = JSON.parse(json)
          allversions = data.builds.slice().reverse()
          selectedVersion = this.data.defaultVersion
          if (this.queryParams.get().version) selectedVersion = this.queryParams.get().version
        } catch (e) {
          addTooltip('Cannot load compiler version list. It might have been blocked by an advertisement blocker. Please try deactivating any of them from this page and reload.')
        }
      } else {
        allversions = [{ path: 'builtin', longVersion: 'latest local version' }]
        selectedVersion = 'builtin'
      }
      callback(allversions, selectedVersion)
    })
  }

  scheduleCompilation () {
    if (!this.config.get('autoCompile')) return
    if (this.data.compileTimeout) window.clearTimeout(this.data.compileTimeout)
    this.data.compileTimeout = window.setTimeout(() => this.compileIfAutoCompileOn(), this.data.timeout)
  }

}

module.exports = CompilerContainer
