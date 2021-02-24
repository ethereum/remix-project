import React, { useState } from 'react' // eslint-disable-line
import semver from 'semver'
import { CompilerContainerProps } from './types'
import * as helper from '../../../../../apps/remix-ide/src/lib/helper'
import { canUseWorker, baseURLBin, baseURLWasm, urlFromVersion, pathToURL, promisedMiniXhr } from '../../../../../apps/remix-ide/src/app/compiler/compiler-utils' // eslint-disable-line

import './css/compiler-container.css'

export const RemixUiSolidityCompiler = (props: CompilerContainerProps) => {
  const { editor, config, queryParams, compileTabLogic } = props // eslint-disable-line
  const [state, setState] = useState({
    hideWarnings: config.get('hideWarnings') || false,
    autoCompile: config.get('autoCompile'),
    compileTimeout: null,
    timeout: 300,
    allversions: null,
    selectedVersion: null,
    defaultVersion: 'soljson-v0.7.4+commit.3f05b770.js', // this default version is defined: in makeMockCompiler (for browser test)
    selectedLanguage: '',
    runs: '',
    compiledFileName: ''
  })

  const currentFile = (name: string = '') => { // eslint-disable-line
    if (name && name !== '') {
      _setCompilerVersionFromPragma(name)
    }
    // if (!this._view.compilationButton) return
    // const button = compilationButton(name.split('/').pop())
    _disableCompileBtn(!name || (name && isSolFileSelected(name)))
    // yo.update(this._view.compilationButton, button)
  }

  // Load solc compiler version according to pragma in contract file
  const _setCompilerVersionFromPragma = (filename: string) => {
    if (!state.allversions) return
    compileTabLogic.fileManager.readFile(filename).then(data => {
      const pragmaArr = data.match(/(pragma solidity (.+?);)/g)
      if (pragmaArr && pragmaArr.length === 1) {
        const pragmaStr = pragmaArr[0].replace('pragma solidity', '').trim()
        const pragma = pragmaStr.substring(0, pragmaStr.length - 1)
        const releasedVersions = state.allversions.filter(obj => !obj.prerelease).map(obj => obj.version)
        const allVersions = state.allversions.map(obj => _retrieveVersion(obj.version))
        const currentCompilerName = _retrieveVersion(/** this._view.versionSelector.selectedOptions[0].label **/)
        // contains only numbers part, for example '0.4.22'
        const pureVersion = _retrieveVersion()
        // is nightly build newer than the last release
        const isNewestNightly = currentCompilerName.includes('nightly') && semver.gt(pureVersion, releasedVersions[0])
        // checking if the selected version is in the pragma range
        const isInRange = semver.satisfies(pureVersion, pragma)
        // checking if the selected version is from official compilers list(excluding custom versions) and in range or greater
        const isOfficial = allVersions.includes(currentCompilerName)
        if (isOfficial && (!isInRange && !isNewestNightly)) {
          const compilerToLoad = semver.maxSatisfying(releasedVersions, pragma)
          const compilerPath = state.allversions.filter(obj => !obj.prerelease && obj.version === compilerToLoad)[0].path
          if (state.selectedVersion !== compilerPath) {
            state.selectedVersion = compilerPath
            _updateVersionSelector()
          }
        }
      }
    })
  }

  // const compilationButton = (name = '') => {
  //   const displayed = name || '<no file selected>'
  //   const disabled = name && isSolFileSelected() ? '' : 'disabled'

  // return yo`
  //   <button id="compileBtn" data-id="compilerContainerCompileBtn" class="btn btn-primary btn-block ${disabled} mt-3" title="Compile" onclick="${this.compile.bind(this)}">
  //     <span>${this._view.compileIcon} Compile ${displayed}</span>
  //   </button>
  // `
  // }

  const _disableCompileBtn = (shouldDisable) => {
    const btn = document.getElementById('compileBtn')
    if (!btn) return
    if (shouldDisable) {
      btn.classList.add('disabled')
    } else if (isSolFileSelected()) {
      btn.classList.remove('disabled')
    }
  }

  const isSolFileSelected = (currentFile = '') => {
    if (!currentFile) currentFile = config.get('currentFile')
    if (!currentFile) return false
    const extention = currentFile.substr(currentFile.length - 3, currentFile.length)
    return extention.toLowerCase() === 'sol' || extention.toLowerCase() === 'yul'
  }

  // const deactivate  = () => {
  //   // deactivate editor listeners
  //   editor.event.unregister('contentChanged')
  //   editor.event.unregister('sessionSwitched')
  // }

  // const activate = () => {
  //   const currentFileName = config.get('currentFile')

  //   currentFile(currentFileName)
  //   listenToEvents()
  // }

  // const listenToEvents = () => {
  //   editor.event.register('sessionSwitched', () => {
  //     // if (!this._view.compileIcon) return
  //     scheduleCompilation()
  //   })

  // this.compileTabLogic.event.on('startingCompilation', () => {
  //   if (!this._view.compileIcon) return
  //   this._view.compileIcon.setAttribute('title', 'compiling...')
  //   this._view.compileIcon.classList.remove(`${css.bouncingIcon}`)
  //   this._view.compileIcon.classList.add(`${css.spinningIcon}`)
  // })

  // this.compileTabLogic.compiler.event.register('compilationDuration', (speed) => {
  //   if (!this._view.warnCompilationSlow) return
  //   if (speed > 1000) {
  //     const msg = `Last compilation took ${speed}ms. We suggest to turn off autocompilation.`
  //     this._view.warnCompilationSlow.setAttribute('title', msg)
  //     this._view.warnCompilationSlow.style.visibility = 'visible'
  //   } else {
  //     this._view.warnCompilationSlow.style.visibility = 'hidden'
  //   }
  // })

  // editor.event.register('contentChanged', () => {
  //   // if (!this._view.compileIcon) return
  //   scheduleCompilation()
  //   // this._view.compileIcon.classList.add(`${css.bouncingIcon}`) // @TODO: compileView tab
  // })

  // this.compileTabLogic.compiler.event.register('loadingCompiler', () => {
  //   if (!this._view.compileIcon) return
  //   this._disableCompileBtn(true)
  //   this._view.compileIcon.setAttribute('title', 'compiler is loading, please wait a few moments.')
  //   this._view.compileIcon.classList.add(`${css.spinningIcon}`)
  //   this._view.warnCompilationSlow.style.visibility = 'hidden'
  //   this._updateLanguageSelector()
  // })

  // this.compileTabLogic.compiler.event.register('compilerLoaded', () => {
  //   if (!this._view.compileIcon) return
  //   this._disableCompileBtn(false)
  //   this._view.compileIcon.setAttribute('title', '')
  //   this._view.compileIcon.classList.remove(`${css.spinningIcon}`)
  //   if (this.data.autoCompile) this.compileIfAutoCompileOn()
  // })

  //   this.compileTabLogic.compiler.event.register('compilationFinished', (success, data, source) => {
  //     if (!this._view.compileIcon) return
  //     this._view.compileIcon.setAttribute('title', 'idle')
  //     this._view.compileIcon.classList.remove(`${css.spinningIcon}`)
  //     this._view.compileIcon.classList.remove(`${css.bouncingIcon}`)
  //   })
  // }

  // const scheduleCompilation = () => {
  //   if (!config.get('autoCompile')) return
  //   if (state.compileTimeout) window.clearTimeout(state.compileTimeout)
  //   state.compileTimeout = window.setTimeout(() => compileIfAutoCompileOn(), state.timeout)
  // }

  const compileIfAutoCompileOn = () => {
    if (config.get('autoCompile')) {
      compile()
    }
  }

  const compile = () => {
    const currentFile = config.get('currentFile')

    if (!isSolFileSelected()) return

    _setCompilerVersionFromPragma(currentFile)
    compileTabLogic.runCompiler()
  }

  const _retrieveVersion = (version?) => {
    // if (!version) version = this._view.versionSelector.value
    return semver.coerce(version) ? semver.coerce(version).version : ''
  }

  const _updateVersionSelector = (customUrl = '') => {
    // update selectedversion of previous one got filtered out
    let selectedVersion = state.selectedVersion
    if (!selectedVersion || !_shouldBeAdded(selectedVersion)) {
      selectedVersion = state.defaultVersion
      setState(prevState => {
        return { ...prevState, selectedVersion }
      })
    }
    // this._view.versionSelector.innerHTML = ''
    // this._view.versionSelector.removeAttribute('disabled')
    queryParams.update({ version: selectedVersion })
    let url

    if (customUrl !== '') {
      selectedVersion = customUrl
      setState(prevState => {
        return { ...prevState, selectedVersion }
      })
      // this._view.versionSelector.appendChild(yo`<option value="${customUrl}" selected>custom</option>`)
      url = customUrl
      queryParams.update({ version: selectedVersion })
    } else if (selectedVersion === 'builtin') {
      let location: string | Location = window.document.location
      let path = location.pathname
      if (!path.startsWith('/')) path = '/' + path
      location = `${location.protocol}//${location.host}${path}assets/js`
      if (location.endsWith('index.html')) location = location.substring(0, location.length - 10)
      if (!location.endsWith('/')) location += '/'
      url = location + 'soljson.js'
    } else {
      if (selectedVersion.indexOf('soljson') !== 0 || helper.checkSpecialChars(selectedVersion)) {
        return console.log('loading ' + selectedVersion + ' not allowed')
      }
      url = `${urlFromVersion(selectedVersion)}`
    }

    // state.allversions.forEach(build => {
    // const option = build.path === state.selectedVersion
    //   ? yo`<option value="${build.path}" selected>${build.longVersion}</option>`
    //   : yo`<option value="${build.path}">${build.longVersion}</option>`

    // if (_shouldBeAdded(option.innerText)) {
    // this._view.versionSelector.appendChild(option)
    // }
    // })

    // Workers cannot load js on "file:"-URLs and we get a
    // "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
    // resort to non-worker version in that case.
    if (selectedVersion !== 'builtin' && canUseWorker(selectedVersion)) {
      compileTabLogic.compiler.loadVersion(true, url)
      // setVersionText('(loading using worker)')
    } else {
      compileTabLogic.compiler.loadVersion(false, url)
      // setVersionText('(loading)')
    }
  }

  const _shouldBeAdded = (version) => {
    return !version.includes('nightly') ||
           (version.includes('nightly') /** && this._view.includeNightlies.checked **/)
  }

  // const setVersionText = (text) => {
  // if (this._view.version) this._view.version.innerText = text
  // }

  const promtCompiler = () => {
    // modalDialogCustom.prompt(
    //   'Add a custom compiler',
    //   'URL',
    //   '',
    //   (url) => this.addCustomCompiler(url)
    // )
  }

  const onchangeLoadVersion = (e) => {
    setState(prevState => {
      return { ...prevState, selectedVersion: e.target.value }
    })
    _updateVersionSelector()
    _updateLanguageSelector()
  }

  const _updateLanguageSelector = () => {
    // This is the first version when Yul is available
    if (!semver.valid(_retrieveVersion()) || semver.lt(_retrieveVersion(), 'v0.5.7+commit.6da8b019.js')) {
      // this._view.languageSelector.setAttribute('disabled', '')
      // this._view.languageSelector.value = 'Solidity'
      // this.compileTabLogic.setLanguage('Solidity')
    } else {
      // this._view.languageSelector.removeAttribute('disabled')
    }
  }

  const onChangeLanguage = (e) => {
    const language = e.target.value

    compileTabLogic.setLanguage(language)
    setState(prevState => {
      return { ...prevState, selectedLanguage: language }
    })
    compileIfAutoCompileOn()
  }

  const onChangeEvmVersion = (e) => {
    let evmVersionSelector = e.target.value

    if (evmVersionSelector === 'evmVersionSelector') {
      evmVersionSelector = null
    }
    compileTabLogic.setEvmVersion(evmVersionSelector)
    // for (let i = 0; i < s.options.length; i++) {
    //   if (i === s.selectedIndex) {
    //     s.options[s.selectedIndex].setAttribute('selected', 'selected')
    //   } else {
    //     s.options[i].removeAttribute('selected')
    //   }
    // }

    compileIfAutoCompileOn()
  }

  const updateAutoCompile = (e) => {
    config.set('autoCompile', e.target.checked)
  }

  const onChangeOptimize = (e) => {
    compileTabLogic.setOptimize(!!e.target.checked)
    if (compileTabLogic.optimize) {
      // this._view.runs.removeAttribute('disabled')
      // compileTabLogic.setRuns(parseInt(this._view.runs.value))
    } else {
      compileTabLogic.setRuns(200)
      // this._view.runs.setAttribute('disabled', '')
    }
    compileIfAutoCompileOn()
  }

  const onChangeRuns = (e) => {
    const runs = e.target.value

    compileTabLogic.setRuns(parseInt(runs))
    compileIfAutoCompileOn()
    setState(prevState => {
      return { ...prevState, runs }
    })
  }

  const hideWarnings = (event) => {
    config.set('hideWarnings', event.target.checked)
    compileIfAutoCompileOn()
  }

  return (
  // this.compileTabLogic.compiler.event.register('compilerLoaded', (version) => this.setVersionText(version))
  // this.fetchAllVersion((allversions, selectedVersion, isURL) => {
  //   this.data.allversions = allversions
  //   if (isURL) this._updateVersionSelector(selectedVersion)
  //   else {
  //     this.data.selectedVersion = selectedVersion
  //     if (this._view.versionSelector) this._updateVersionSelector()
  //   }
  // })

  // this._view.warnCompilationSlow = yo`<i title="Compilation Slow" style="visibility:hidden" class="${css.warnCompilationSlow} fas fa-exclamation-triangle" aria-hidden="true"></i>`
  // this._view.compileIcon = yo`<i class="fas fa-sync ${css.icon}" aria-hidden="true"></i>`
  // this._view.autoCompile = yo`<input class="${css.autocompile} custom-control-input" onchange=${() => this.updateAutoCompile()} data-id="compilerContainerAutoCompile" id="autoCompile" type="checkbox" title="Auto compile">`
  // this._view.hideWarningsBox = yo`<input class="${css.autocompile} custom-control-input" onchange=${() => this.hideWarnings()} id="hideWarningsBox" type="checkbox" title="Hide warnings">`
  // if (this.data.autoCompile) this._view.autoCompile.setAttribute('checked', '')
  // if (this.data.hideWarnings) this._view.hideWarningsBox.setAttribute('checked', '')

  // this._view.optimize = yo`<input onchange=${() => this.onchangeOptimize()} class="custom-control-input" id="optimize" type="checkbox">`
  // if (this.compileTabLogic.optimize) this._view.optimize.setAttribute('checked', '')

  // this._view.runs = yo`<input
  //   min="1"
  //   class="custom-select ml-2 ${css.runs}"
  //   id="runs"
  //   placeholder="200"
  //   value="200"
  //   type="number"
  //   title="Estimated number of times each opcode of the deployed code will be executed across the life-time of the contract."
  //   onchange=${() => this.onchangeRuns()}
  // >`
  // if (this.compileTabLogic.optimize) {
  //   this._view.runs.removeAttribute('disabled')
  //   this._view.runs.value = this.compileTabLogic.runs
  // } else {
  //   this._view.runs.setAttribute('disabled', '')
  // }

    <section>
      <article>
        <header className='remixui_compilerSection border-bottom'>
          <div className="mb-2">
            <label className="remixui_compilerLabel form-check-label" htmlFor="versionSelector">
              Compiler
              <button className="far fa-plus-square border-0 p-0 mx-2 btn-sm" onClick={promtCompiler} title="Add a custom compiler with URL"></button>
            </label>
            <select onChange={onchangeLoadVersion} className="custom-select" id="versionSelector" disabled>
              <option disabled selected>{ state.defaultVersion }</option>
              <option disabled>builtin</option>
            </select>
          </div>
          <div className="mb-2 remixui_nightlyBuilds custom-control custom-checkbox">
            <input className="mr-2 custom-control-input" id="nightlies" type="checkbox" onChange={() => _updateVersionSelector()} />
            <label htmlFor="nightlies" className="form-check-label custom-control-label">Include nightly builds</label>
          </div>
          <div className="mb-2">
            <label className="remixui_compilerLabel form-check-label" htmlFor="compilierLanguageSelector">Language</label>
            <select onChange={onChangeLanguage} className="custom-select" id="compilierLanguageSelector" title="Available since v0.5.7">
              <option>Solidity</option>
              <option>Yul</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="remixui_compilerLabel form-check-label" htmlFor="evmVersionSelector">EVM Version</label>
            <select onChange={onChangeEvmVersion} className="custom-select" id="evmVersionSelector">
              <option value="default" selected={true}>compiler default</option>
              <option>muirGlacier</option>
              <option>istanbul</option>
              <option>petersburg</option>
              <option>constantinople</option>
              <option>byzantium</option>
              <option>spuriousDragon</option>
              <option>tangerineWhistle</option>
              <option>homestead</option>
            </select>
          </div>
          <div className="mt-3">
            <p className="mt-2 remixui_compilerLabel">Compiler Configuration</p>
            <div className="mt-2 remixui_compilerConfig custom-control custom-checkbox">
              <input className="remixui_autocompile} custom-control-input" onChange={updateAutoCompile} data-id="compilerContainerAutoCompile" id="autoCompile" type="checkbox" title="Auto compile" />
              <label className="form-check-label custom-control-label" htmlFor="autoCompile">Auto compile</label>
            </div>
            <div className="mt-2 remixui_compilerConfig custom-control custom-checkbox">
              <div className="justify-content-between align-items-center d-flex">
                <input onChange={onChangeOptimize} className="custom-control-input" id="optimize" type="checkbox" />
                <label className="form-check-label custom-control-label" htmlFor="optimize">Enable optimization</label>
                <input
                  min="1"
                  className="custom-select ml-2 remixui_runs"
                  id="runs"
                  placeholder="200"
                  value="200"
                  type="number"
                  title="Estimated number of times each opcode of the deployed code will be executed across the life-time of the contract."
                  onChange={onChangeRuns}
                />
              </div>
            </div>
            <div className="mt-2 remixui_compilerConfig custom-control custom-checkbox">
              <input className="remixui_autocompile custom-control-input" onChange={hideWarnings} id="hideWarningsBox" type="checkbox" title="Hide warnings" />
              <label className="form-check-label custom-control-label" htmlFor="hideWarningsBox">Hide warnings</label>
            </div>
          </div>
          <button id="compileBtn" data-id="compilerContainerCompileBtn" className="btn btn-primary btn-block remixui_disabled mt-3" title="Compile" onClick={compile}>
            <span><i className="fas fa-sync remixui_icon" aria-hidden="true"></i> Compile { state.compiledFileName || '<no file selected>' }</span>
          </button>
        </header>
      </article>
    </section>
  )
}

export default RemixUiSolidityCompiler
