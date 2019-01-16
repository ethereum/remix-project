/* global Worker */
const yo = require('yo-yo')
var minixhr = require('minixhr')
var helper = require('../../../lib/helper')
const addTooltip = require('../../ui/tooltip')

const styleGuide = require('../../ui/styles-guide/theme-chooser')
const styles = styleGuide.chooser()
var css = require('../styles/compile-tab-styles')

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
      defaultVersion: 'soljson-v0.5.1+commit.c8a2cb62.js', // this default version is defined: in makeMockCompiler (for browser test) and in package.json (downloadsolc_root) for the builtin compiler
      baseurl: 'https://solc-bin.ethereum.org/bin'
    }

    this.listenToEvents()
  }

  listenToEvents () {
    this.editor.event.register('contentChanged', this.scheduleCompilation.bind(this))
    this.editor.event.register('sessionSwitched', this.scheduleCompilation.bind(this))

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
      this._view.compileIcon.classList.add(`${css.bouncingIcon}`) // @TODO: compileView tab
    })

    this.compileTabLogic.compiler.event.register('loadingCompiler', () => {
      if (!this._view.compileIcon) return
      this._view.compileIcon.classList.add(`${css.spinningIcon}`)
      this._view.warnCompilationSlow.style.visibility = 'hidden'
      this._view.compileIcon.setAttribute('title', 'compiler is loading, please wait a few moments.')
    })

    this.compileTabLogic.compiler.event.register('compilationStarted', () => {
      if (!this._view.compileIcon) return
      this._view.compileIcon.classList.remove(`${css.bouncingIcon}`)
      this._view.compileIcon.classList.add(`${css.spinningIcon}`)
      this._view.compileIcon.setAttribute('title', 'compiling...')
    })

    this.compileTabLogic.compiler.event.register('compilerLoaded', () => {
      if (!this._view.compileIcon) return
      this._view.compileIcon.classList.remove(`${css.spinningIcon}`)
      this._view.compileIcon.setAttribute('title', '')
    })

    this.compileTabLogic.compiler.event.register('compilationFinished', (success, data, source) => {
      if (!this._view.compileIcon) return
      this._view.compileIcon.style.color = styles.colors.black
      this._view.compileIcon.classList.remove(`${css.spinningIcon}`)
      this._view.compileIcon.classList.remove(`${css.bouncingIcon}`)
      this._view.compileIcon.setAttribute('title', 'idle')
    })
  }

  render () {
    this.compileTabLogic.compiler.event.register('compilerLoaded', (version) => this.setVersionText(version))
    this.fetchAllVersion((allversions, selectedVersion) => {
      this.data.allversions = allversions
      this.data.selectedVersion = selectedVersion
      if (this._view.versionSelector) this._updateVersionSelector()
    })

    this._view.warnCompilationSlow = yo`<i title="Compilation Slow" style="visibility:hidden" class="${css.warnCompilationSlow} fa fa-exclamation-triangle" aria-hidden="true"></i>`
    this._view.compileIcon = yo`<i class="fa fa-refresh ${css.icon}" aria-hidden="true"></i>`
    this._view.compileButton = yo`<div class="${css.compileButton}" onclick=${this.compile.bind(this)} id="compile" title="Compile source code">${this._view.compileIcon} Start to compile (Ctrl-S)</div>`
    this._view.autoCompile = yo`<input class="${css.autocompile}" onchange=${this.updateAutoCompile.bind(this)} id="autoCompile" type="checkbox" title="Auto compile">`
    this._view.hideWarningsBox = yo`<input class="${css.autocompile}" onchange=${this.hideWarnings.bind(this)} id="hideWarningsBox" type="checkbox" title="Hide warnings">`
    if (this.data.autoCompile) this._view.autoCompile.setAttribute('checked', '')
    if (this.data.hideWarnings) this._view.hideWarningsBox.setAttribute('checked', '')

    this._view.optimize = yo`<input onchange=${this.onchangeOptimize.bind(this)} id="optimize" type="checkbox">`
    if (this.compileTabLogic.optimize) this._view.optimize.setAttribute('checked', '')

    this._view.versionSelector = yo`
      <select onchange=${this.onchangeLoadVersion.bind(this)} class="${css.select}" id="versionSelector" disabled>
        <option disabled selected>Select new compiler version</option>
      </select>`
    this._view.version = yo`<span id="version"></span>`

    this._view.compileContainer = yo`
      <div class="${css.compileContainer}">
        <div class="${css.info}">
          <span>Current version:</span> ${this._view.version}
          <div class="${css.crow}">
            ${this._view.versionSelector}
          </div>
          <div class="${css.compileButtons}">
            <div class=${css.checkboxes}>
              <div class="${css.autocompileContainer}">
                ${this._view.autoCompile}
                <label for="autoCompile" class="${css.autocompileText}">Auto compile</label>
              </div>
              <div class="${css.optimizeContainer}">
                <div>${this._view.optimize}</div>
                <label for="optimize" class="${css.checkboxText}">Enable Optimization</label>
              </div>
              <div class=${css.hideWarningsContainer}>
                ${this._view.hideWarningsBox}
                <label for="hideWarningsBox" class="${css.autocompileText}">Hide warnings</label>
              </div>
            </div>
            ${this._view.compileButton}
          </div>
        </div>
      </div>`

    return this._view.compileContainer
  }

  updateAutoCompile (event) {
    this.config.set('autoCompile', this._view.autoCompile.checked)
  }

  compile (event) {
    this.compileTabLogic.runCompiler()
  }

  hideWarnings (event) {
    this.config.set('hideWarnings', this._view.hideWarningsBox.checked)
    this.compile()
  }

  onchangeOptimize () {
    this.compileTabLogic.setOptimize(!!this._view.optimize.checked)
    this.compileTabLogic.runCompiler()
  }

  onchangeLoadVersion (event) {
    this.data.selectedVersion = this._view.versionSelector.value
    this._updateVersionSelector()
  }

  _updateVersionSelector () {
    this._view.versionSelector.innerHTML = ''
    this._view.versionSelector.appendChild(yo`<option disabled selected>Select new compiler version</option>`)
    this.data.allversions.forEach(build => this._view.versionSelector.appendChild(yo`<option value=${build.path}>${build.longVersion}</option>`))
    this._view.versionSelector.removeAttribute('disabled')
    this.queryParams.update({ version: this.data.selectedVersion })
    var url
    if (this.data.selectedVersion === 'builtin') {
      var location = window.document.location
      location = location.protocol + '//' + location.host + '/' + location.pathname
      if (location.endsWith('index.html')) location = location.substring(0, location.length - 10)
      if (!location.endsWith('/')) location += '/'
      url = location + 'soljson.js'
    } else {
      if (this.data.selectedVersion.indexOf('soljson') !== 0 || helper.checkSpecialChars(this.data.selectedVersion)) {
        return console.log('loading ' + this.data.selectedVersion + ' not allowed')
      }
      url = `${this.data.baseurl}/${this.data.selectedVersion}`
    }
    var isFirefox = typeof InstallTrigger !== 'undefined'
    if (document.location.protocol !== 'file:' && Worker !== undefined && isFirefox) {
      // Workers cannot load js on "file:"-URLs and we get a
      // "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
      // resort to non-worker version in that case.
      this.compileTabLogic.compiler.loadVersion(true, url)
      this.setVersionText('(loading using worker)')
    } else {
      this.compileTabLogic.compiler.loadVersion(false, url)
      this.setVersionText('(loading)')
    }
  }

  setVersionText (text) {
    this.data.version = text
    if (this._view.version) this._view.version.innerText = text
  }

  fetchAllVersion (callback) {
    minixhr(`${this.data.baseurl}/list.json`, (json, event) => {
      // @TODO: optimise and cache results to improve app loading times
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
    this.data.compileTimeout = window.setTimeout(() => this.compileTabLogic.runCompiler(), this.data.timeout)
  }

}

module.exports = CompilerContainer
