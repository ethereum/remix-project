import React, {useEffect, useState, useRef, useReducer, useContext} from 'react' // eslint-disable-line
import { FormattedMessage, useIntl } from 'react-intl'
import semver from 'semver'
import { CompilerContainerProps } from './types'
import { ConfigurationSettings } from '@remix-project/remix-lib'
import { checkSpecialChars, CustomTooltip, extractNameFromKey } from '@remix-ui/helper'
import { canUseWorker, urlFromVersion, pathToURL } from '@remix-project/remix-solidity'
import { compilerReducer, compilerInitialState } from './reducers/compiler'
import { listenToEvents } from './actions/compiler'
import { getValidLanguage } from '@remix-project/remix-solidity'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { configFileContent } from './compilerConfiguration'
import { appPlatformTypes, platformContext, onLineContext } from '@remix-ui/app'
import * as packageJson from '../../../../../package.json'

import './css/style.css'

import { CompilerDropdown } from './components/compiler-dropdown'

const defaultPath = 'compiler_config.json'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _paq: any
  }
}
const _paq = (window._paq = window._paq || []) //eslint-disable-line

export const CompilerContainer = (props: CompilerContainerProps) => {
  const online = useContext(onLineContext)
  const platform = useContext(platformContext)
  const {
    api,
    compileTabLogic,
    tooltip,
    modal,
    compiledFileName,
    updateCurrentVersion,
    configurationSettings,
    isHardhatProject,
    isTruffleProject,
    isFoundryProject,
    workspaceName,
    configFilePath,
    setConfigFilePath,
    solJsonBinData,
    //@ts-ignore
    pluginProps
  } = props // eslint-disable-line

  const [state, setState] = useState({
    hideWarnings: false,
    autoCompile: false,
    useFileConfiguration: false,
    matomoAutocompileOnce: true,
    optimize: false,
    compileTimeout: null,
    timeout: 300,
    customVersions: [],
    downloaded: [],
    compilerLicense: null,
    selectedVersion: null,
    defaultVersion: packageJson.defaultVersion, // this default version is defined: in makeMockCompiler (for browser test)
    runs: '',
    compiledFileName: '',
    includeNightlies: false,
    language: 'Solidity',
    remappings: [],
    evmVersion: '',
    createFileOnce: true,
    onlyDownloaded: false,
    updatedVersionSelectorFromUrlQuery: false,
  })
  const [showFilePathInput, setShowFilePathInput] = useState<boolean>(false)
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)
  const [disableCompileButton, setDisableCompileButton] = useState<boolean>(false)
  const compileIcon = useRef(null)
  const promptMessageInput = useRef(null)
  const configFilePathInput = useRef(null)
  const [hhCompilation, sethhCompilation] = useState(false)
  const [truffleCompilation, setTruffleCompilation] = useState(false)
  const [compilerContainer, dispatch] = useReducer(compilerReducer, compilerInitialState)

  const intl = useIntl()

  useEffect(() => {
    if (workspaceName) {
      api.setAppParameter('configFilePath', defaultPath)
      if (state.useFileConfiguration) {
        api.fileExists(defaultPath).then((exists) => {
          if (!exists && state.useFileConfiguration) {
            configFilePathInput.current.value = defaultPath
            createNewConfigFile()
          }
        })
      }
      setShowFilePathInput(false)
    }
  }, [workspaceName])

  useEffect(() => {
    if (state.useFileConfiguration) {
      api.fileExists(defaultPath).then((exists) => {
        if (!exists) createNewConfigFile()
      })
      setToggleExpander(true)
    }
  }, [state.useFileConfiguration])

  useEffect(() => {
    if (online && state.onlyDownloaded){
      // @ts-ignore
      api.call('compilerloader','getJsonBinData')
    }
    setState((prevState) => {
      return { ...prevState, onlyDownloaded: !online }
    })
  },[online])

  useEffect(() => {
    const listener = (event) => {
      if (configFilePathInput.current !== event.target && event.target.innerText !== 'Create') {
        setShowFilePathInput(false)
        configFilePathInput.current.value = ''
        return
      }
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [])

  useEffect(() => {
    if (!solJsonBinData) return
    if (!state.updatedVersionSelectorFromUrlQuery && solJsonBinData.binList && solJsonBinData.binList.length) {
      const versionFromQueryParameter = getSelectVersionFromQueryParam()
      if (versionFromQueryParameter.isURL) _updateVersionSelector(state.defaultVersion, versionFromQueryParameter.selectedVersion)
      else {
        setState((prevState) => {
          return { ...prevState, selectedVersion: versionFromQueryParameter.selectedVersion }
        })
        updateCurrentVersion(versionFromQueryParameter.selectedVersion)
        _updateVersionSelector(versionFromQueryParameter.selectedVersion)
      }
      setState((prevState) => {
        return { ...prevState, updatedVersionSelectorFromUrlQuery: true }
      })
    } else if (!solJsonBinData.binList || (solJsonBinData.binList && solJsonBinData.binList.length == 0)){
      const version = 'builtin'
      setState((prevState) => {
        return { ...prevState, selectedVersion: version }
      })
      updateCurrentVersion(version)
      _updateVersionSelector(version, '', false)
    }
  }, [solJsonBinData])

  useEffect(() => {
    const currentFileName = api.currentFile
    currentFile(currentFileName)
    listenToEvents(compileTabLogic, api)(dispatch)
  }, [])

  useEffect(() => {
    ;(async () => {
      if (compileTabLogic && compileTabLogic.compiler) {
        const autocompile = ((await api.getAppParameter('autoCompile')) as boolean) || false
        const hideWarnings = ((await api.getAppParameter('hideWarnings')) as boolean) || false
        const includeNightlies = ((await api.getAppParameter('includeNightlies')) as boolean) || false
        const useFileConfiguration = ((await api.getAppParameter('useFileConfiguration')) as boolean) || false
        let configFilePathSaved = await api.getAppParameter('configFilePath')
        if (!configFilePathSaved || configFilePathSaved == '') configFilePathSaved = defaultPath

        setConfigFilePath(configFilePathSaved)

        setState((prevState) => {
          const params = api.getCompilerQueryParameters()
          const optimize = params.optimize
          const runs = params.runs as string
          const evmVersion = compileTabLogic.evmVersions.includes(params.evmVersion) ? params.evmVersion : 'default'
          const language = getValidLanguage(params.language)

          return {
            ...prevState,
            hideWarnings: hideWarnings,
            autoCompile: autocompile,
            includeNightlies: includeNightlies,
            useFileConfiguration: useFileConfiguration,
            optimize: optimize,
            runs: runs,
            evmVersion: evmVersion !== null && evmVersion !== 'null' && evmVersion !== undefined && evmVersion !== 'undefined' ? evmVersion : 'default',
            language: language !== null ? language : 'Solidity'
          }
        })
      }
    })()
  }, [compileTabLogic])

  useEffect(() => {
    const isDisabled = !compiledFileName || (compiledFileName && !isSolFileSelected(compiledFileName))

    setDisableCompileButton(isDisabled)
    setState((prevState) => {
      return { ...prevState, compiledFileName }
    })
  }, [compiledFileName])

  useEffect(() => {
    if (compilerContainer.compiler.mode) {
      switch (compilerContainer.compiler.mode) {
      case 'startingCompilation':
        startingCompilation()
        break
      case 'compilationDuration':
        compilationDuration(compilerContainer.compiler.args[0])
        break
      case 'loadingCompiler':
        loadingCompiler()
        break
      case 'compilerLoaded':
        compilerLoaded(compilerContainer.compiler.args[1])
        break
      case 'compilationFinished':
        compilationFinished()
        break
      }
    }
  }, [compilerContainer.compiler.mode])

  useEffect(() => {
    if (compilerContainer.editor.mode) {
      if (compilerContainer.editor.mode.startsWith('sessionSwitched')) {
        sessionSwitched()
        return
      } else if (compilerContainer.editor.mode.startsWith('contentChanged')) {
        contentChanged()
        return
      }
    }
  }, [compilerContainer.editor.mode])

  useEffect(() => {
    compileTabLogic.setUseFileConfiguration(state.useFileConfiguration)
    if (state.useFileConfiguration) compileTabLogic.setConfigFilePath(configFilePath)
  }, [state.useFileConfiguration])

  useEffect(() => {
    if (configurationSettings) {
      setConfiguration(configurationSettings)
    }
  }, [configurationSettings])

  const toggleConfigType = () => {
    if (state.useFileConfiguration)
      if (state.createFileOnce) {
        api.fileExists(defaultPath).then((exists) => {
          if (!exists || state.useFileConfiguration) createNewConfigFile()
        })
        setState((prevState) => {
          return { ...prevState, createFileOnce: false }
        })
      }

    setState((prevState) => {
      api.setAppParameter('useFileConfiguration', !state.useFileConfiguration)
      return { ...prevState, useFileConfiguration: !state.useFileConfiguration }
    })
  }

  const openFile = async () => {
    await api.open(configFilePath)
  }

  const createNewConfigFile = async () => {
    let filePath = configFilePathInput.current && configFilePathInput.current.value !== '' ? configFilePathInput.current.value : configFilePath
    if (filePath === '') filePath = defaultPath
    if (!filePath.endsWith('.json')) filePath = filePath + '.json'

    let compilerConfig = configFileContent
    if (isFoundryProject && !compilerConfig.includes('remappings')) {
      const config = JSON.parse(compilerConfig)
      config.settings.remappings = ['ds-test/=lib/forge-std/lib/ds-test/src/', 'forge-std/=lib/forge-std/src/']
      compilerConfig = JSON.stringify(config, null, '\t')
    }
    await api.writeFile(filePath, compilerConfig)
    api.setAppParameter('configFilePath', filePath)
    setConfigFilePath(filePath)
    compileTabLogic.setConfigFilePath(filePath)
    setShowFilePathInput(false)
  }

  const handleConfigPathChange = async () => {
    if (configFilePathInput.current.value !== '') {
      if (!configFilePathInput.current.value.endsWith('.json')) configFilePathInput.current.value += '.json'

      if (await api.fileExists(configFilePathInput.current.value)) {
        api.setAppParameter('configFilePath', configFilePathInput.current.value)
        setConfigFilePath(configFilePathInput.current.value)
        compileTabLogic.setConfigFilePath(configFilePathInput.current.value)

        setShowFilePathInput(false)
      } else {
        modal(
          intl.formatMessage({ id: 'solidity.newConfigFileTitle' }),
          intl.formatMessage({ id: 'solidity.newConfigFileMessage' }, { configFilePathInput: configFilePathInput.current.value }),
          intl.formatMessage({ id: 'solidity.create' }),
          async () => await createNewConfigFile(),
          false,
          intl.formatMessage({ id: 'solidity.cancel' }),
          () => {
            setShowFilePathInput(false)
          }
        )
      }
    }
  }

  const _retrieveVersion = (version?) => {
    if (!version) version = state.selectedVersion
    if (version === 'builtin') version = state.defaultVersion
    return semver.coerce(version) ? semver.coerce(version).version : ''
  }

  const getSelectVersionFromQueryParam = () => {
    let selectedVersion = state.defaultVersion
    let isURL = false
    try {
      const versions = [...solJsonBinData.binList]
      versions.reverse()

      if (api.getCompilerQueryParameters().version) {
        const versionFromURL = api.getCompilerQueryParameters().version
        // Check if version is a URL and corresponding filename starts with 'soljson'
        if (versionFromURL.startsWith('https://')) {
          const urlArr = versionFromURL.split('/')
          if (urlArr[urlArr.length - 1].startsWith('soljson')) {
            isURL = true
            selectedVersion = versionFromURL
          }
        } else {
          // URL version can be like 0.8.7+commit.e28d00a7, 0.8.7 or soljson-v0.8.7+commit.e28d00a7.js
          const selectedVersionArr = versions.filter((obj) => obj.path === versionFromURL || obj.longVersion === versionFromURL || obj.version === versionFromURL)
          // for version like 0.8.15, there will be more than one elements in the array
          // In that case too, index 0 will have non-nightly version object
          if (selectedVersionArr.length) selectedVersion = selectedVersionArr[0].path
        }
      }

    } catch (e) {
      tooltip(intl.formatMessage({ id: 'solidity.tooltipText5' }) + e)
    }

    return { selectedVersion, isURL }
  }

  /**
   * Update the compilation button with the name of the current file
   */
  const currentFile = (name = '') => {
    if (name && name !== '') {
      _setCompilerVersionFromPragma(name)
    }
    const compiledFileName = name.split('/').pop()

    setState((prevState) => {
      return { ...prevState, compiledFileName }
    })
  }

  // Load solc compiler version according to pragma in contract file
  const _setCompilerVersionFromPragma = (filename: string) => {
    if (solJsonBinData && !solJsonBinData.selectorList) return
    api.readFile(filename).then((data) => {
      if (!data) return
      const pragmaArr = data.match(/(pragma solidity (.+?);)/g)
      if (pragmaArr && pragmaArr.length === 1) {
        const pragmaStr = pragmaArr[0].replace('pragma solidity', '').trim()
        const pragma = pragmaStr.substring(0, pragmaStr.length - 1)
        const releasedVersions = solJsonBinData.selectorList.filter((obj) => !obj.prerelease).map((obj) => obj.version)
        const allVersions = solJsonBinData.selectorList.map((obj) => _retrieveVersion(obj.version))
        const currentCompilerName = _retrieveVersion(state.selectedVersion)
        // contains only numbers part, for example '0.4.22'
        const pureVersion = _retrieveVersion()
        // is nightly build newer than the last release
        const isNewestNightly = currentCompilerName.includes('nightly') && semver.gt(pureVersion, releasedVersions[0])
        // checking if the selected version is in the pragma range
        const isInRange = semver.satisfies(pureVersion, pragma)
        // checking if the selected version is from official compilers list(excluding custom versions) and in range or greater
        const isOfficial = allVersions.includes(currentCompilerName)
        if (isOfficial && !isInRange && !isNewestNightly) {
          const compilerToLoad = semver.maxSatisfying(releasedVersions, pragma)
          const compilerPath = solJsonBinData.selectorList.filter((obj) => !obj.prerelease && obj.version === compilerToLoad)[0].path
          if (state.selectedVersion !== compilerPath) {
            // @ts-ignore
            api.call('notification', 'toast', intl.formatMessage({ id: 'solidity.toastMessage' }, { version: _retrieveVersion(compilerPath) }))
            setState((prevState) => {
              return { ...prevState, selectedVersion: compilerPath }
            })
            _updateVersionSelector(compilerPath)
          }
        }
      }
    })
  }

  const isSolFileSelected = (currentFile = '') => {
    if (!currentFile) currentFile = api.currentFile
    if (!currentFile) return false
    const extension = currentFile.substr(currentFile.length - 3, currentFile.length)
    return extension.toLowerCase() === 'sol' || extension.toLowerCase() === 'yul'
  }

  const sessionSwitched = () => {
    if (!compileIcon.current) return
    scheduleCompilation()
  }

  const startingCompilation = () => {
    if (!compileIcon.current) return
    compileIcon.current.setAttribute('title', 'compiling...')
    compileIcon.current.classList.remove('remixui_bouncingIcon')
    compileIcon.current.classList.add('remixui_spinningIcon')
  }

  const compilationDuration = (speed: number) => {
    if (speed > 1000) {
      console.log(`Last compilation took ${speed}ms. We suggest to turn off autocompilation.`)
    }
  }

  const contentChanged = () => {
    if (!compileIcon.current) return
    scheduleCompilation()
    compileIcon.current.classList.add('remixui_bouncingIcon') // @TODO: compileView tab
  }

  const loadingCompiler = () => {
    if (!compileIcon.current) return
    compileIcon.current.setAttribute('title', intl.formatMessage({ id: 'solidity.compileIconAttribute' }))
    compileIcon.current.classList.add('remixui_spinningIcon')
    setState((prevState) => {
      return {
        ...prevState,
        compilerLicense: intl.formatMessage({ id: 'solidity.compilerLicenseMsg1' })
      }
    })
    _updateLanguageSelector()
    setDisableCompileButton(true)
  }

  const compilerLoaded = (license) => {
    if (!compileIcon.current) return
    compileIcon.current.setAttribute('title', '')
    compileIcon.current.classList.remove('remixui_spinningIcon')
    setState((prevState) => {
      return {
        ...prevState,
        compilerLicense: license ? license : intl.formatMessage({ id: 'solidity.compilerLicenseMsg2' })
      }
    })
    if (state.autoCompile) compile()
    const isDisabled = !compiledFileName || (compiledFileName && !isSolFileSelected(compiledFileName))

    setDisableCompileButton(isDisabled)

    // just for e2e
    // eslint-disable-next-line no-case-declarations
    const elements = document.querySelectorAll('[data-id="compilerloaded"]')
    // remove elements
    for (let i = 0; i < elements.length; i++) {
      elements[i].remove()
    }
    const loadedElement = document.createElement('span')
    loadedElement.setAttribute('data-id', 'compilerloaded')
    loadedElement.setAttribute('data-version', state.selectedVersion)
    document.body.appendChild(loadedElement)
  }

  const compilationFinished = () => {
    if (!compileIcon.current) return
    compileIcon.current.setAttribute('title', 'idle')
    compileIcon.current.classList.remove('remixui_spinningIcon')
    compileIcon.current.classList.remove('remixui_bouncingIcon')
    if (!state.autoCompile || (state.autoCompile && state.matomoAutocompileOnce)) {
      _paq.push(['trackEvent', 'compiler', 'compiled', 'solCompilationFinishedTriggeredByUser'])
      _paq.push(['trackEvent', 'compiler', 'compiled', 'with_config_file_' + state.useFileConfiguration])
      _paq.push(['trackEvent', 'compiler', 'compiled', 'with_version_' + _retrieveVersion()])
      if (state.autoCompile && state.matomoAutocompileOnce) {
        setState((prevState) => {
          return { ...prevState, matomoAutocompileOnce: false }
        })
      }
    }
  }

  const scheduleCompilation = () => {
    if (!state.autoCompile) return
    if (state.compileTimeout) window.clearTimeout(state.compileTimeout)
    const compileTimeout = window.setTimeout(() => {
      state.autoCompile && compile()
    }, state.timeout)

    setState((prevState) => {
      return { ...prevState, compileTimeout }
    })
  }

  const compile = () => {
    const currentFile = api.currentFile

    if (!isSolFileSelected()) return
    _setCompilerVersionFromPragma(currentFile)
    let externalCompType
    if (hhCompilation) externalCompType = 'hardhat'
    else if (truffleCompilation) externalCompType = 'truffle'
    compileTabLogic.runCompiler(externalCompType)
  }

  const compileAndRun = () => {
    const currentFile = api.currentFile

    if (!isSolFileSelected()) return
    _setCompilerVersionFromPragma(currentFile)
    let externalCompType
    if (hhCompilation) externalCompType = 'hardhat'
    else if (truffleCompilation) externalCompType = 'truffle'
    api.runScriptAfterCompilation(currentFile)
    compileTabLogic.runCompiler(externalCompType)
  }

  const _updateVersionSelector = (version, customUrl = '', setQueryParameter = true) => {
    // update selectedversion of previous one got filtered out
    let selectedVersion = version
    if (!selectedVersion || !_shouldBeAdded(selectedVersion)) {
      selectedVersion = state.defaultVersion
      setState((prevState) => {
        return { ...prevState, selectedVersion }
      })
    }
    updateCurrentVersion(selectedVersion)
    if (setQueryParameter)
      api.setCompilerQueryParameters({ version: selectedVersion })
    let url

    if (customUrl !== '') {
      selectedVersion = customUrl
      setState((prevState) => {
        return {
          ...prevState,
          selectedVersion,
          customVersions: [...state.customVersions, selectedVersion]
        }
      })
      updateCurrentVersion(selectedVersion)
      url = customUrl
      if (setQueryParameter)
        api.setCompilerQueryParameters({ version: selectedVersion })
    } else {
      if (checkSpecialChars(selectedVersion)) {
        return console.log('loading ' + selectedVersion + ' not allowed, special chars not allowed.')
      }
      if (selectedVersion === 'builtin' || selectedVersion.indexOf('soljson') === 0) {
        url = urlFromVersion(selectedVersion)
      } else {
        return console.log('loading ' + selectedVersion + ' not allowed, version should start with "soljson"')
      }
    }

    // Workers cannot load js on "file:"-URLs and we get a
    // "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
    // resort to non-worker version in that case.
    if (selectedVersion === 'builtin') selectedVersion = state.defaultVersion
    if (selectedVersion !== 'builtin' && (canUseWorker(selectedVersion) || platform === appPlatformTypes.desktop)) {
      compileTabLogic.compiler.loadVersion(true, url)
    } else {
      compileTabLogic.compiler.loadVersion(false, url)
    }
  }

  const _shouldBeAdded = (version) => {
    return !version.includes('nightly') || (version.includes('nightly') && state.includeNightlies)
  }

  const promptCompiler = () => {
    // custom url https://solidity-blog.s3.eu-central-1.amazonaws.com/data/08preview/soljson.js
    modal(
      intl.formatMessage({
        id: 'solidity.addACustomCompiler'
      }),
      promptMessage('URL'),
      intl.formatMessage({ id: 'solidity.ok' }),
      addCustomCompiler,
      false,
      intl.formatMessage({ id: 'solidity.cancel' }),
      () => {}
    )
  }

  const showCompilerLicense = () => {
    modal(
      intl.formatMessage({ id: 'solidity.compilerLicense' }),
      state.compilerLicense ? state.compilerLicense : intl.formatMessage({ id: 'solidity.compilerLicenseMsg3' }),
      intl.formatMessage({ id: 'solidity.ok' }),
      () => {}
    )
  }

  const promptMessage = (message) => {
    return (
      <>
        <span>{message}</span>
        <input type="text" data-id="modalDialogCustomPromptCompiler" className="form-control" ref={promptMessageInput} />
      </>
    )
  }

  const addCustomCompiler = () => {
    const url = promptMessageInput.current.value

    setState((prevState) => {
      return { ...prevState, selectedVersion: url }
    })
    _updateVersionSelector(state.defaultVersion, url)
  }

  const handleLoadVersion = (value) => {
    if (value !== 'builtin' && !pathToURL[value]) return
    setState((prevState) => {
      return { ...prevState, selectedVersion: value, matomoAutocompileOnce: true }
    })
    updateCurrentVersion(value)
    _updateVersionSelector(value)
    _updateLanguageSelector()
  }

  const _updateLanguageSelector = () => {
    // This is the first version when Yul is available
    if (!semver.valid(_retrieveVersion()) || semver.lt(_retrieveVersion(), 'v0.5.7+commit.6da8b019.js')) {
      handleLanguageChange('Solidity')
      compileTabLogic.setLanguage('Solidity')
    }
  }

  const handleAutoCompile = (e) => {
    const checked = e.target.checked

    api.setAppParameter('autoCompile', checked)
    checked && compile()
    setState((prevState) => {
      return {
        ...prevState,
        autoCompile: checked,
        matomoAutocompileOnce: state.matomoAutocompileOnce || checked
      }
    })
  }

  const handleOptimizeChange = (value) => {
    const checked = !!value

    api.setAppParameter('optimize', checked)
    compileTabLogic.setOptimize(checked)
    if (compileTabLogic.optimize) {
      compileTabLogic.setRuns(parseInt(state.runs))
    } else {
      compileTabLogic.setRuns(200)
    }
    state.autoCompile && compile()
    setState((prevState) => {
      return { ...prevState, optimize: checked }
    })
  }

  const onChangeRuns = (value) => {
    const runs = value

    compileTabLogic.setRuns(parseInt(runs))
    state.autoCompile && compile()
    setState((prevState) => {
      return { ...prevState, runs }
    })
  }

  const handleHideWarningsChange = (e) => {
    const checked = e.target.checked

    api.setAppParameter('hideWarnings', checked)
    state.autoCompile && compile()
    setState((prevState) => {
      return { ...prevState, hideWarnings: checked }
    })
  }

  const handleNightliesChange = (e) => {
    const checked = e.target.checked

    if (!checked) handleLoadVersion(state.defaultVersion)
    api.setAppParameter('includeNightlies', checked)
    setState((prevState) => {
      return { ...prevState, includeNightlies: checked }
    })
  }

  const handleOnlyDownloadedChange = (e) => {
    const checked = e.target.checked
    if (!checked) handleLoadVersion(state.defaultVersion)
    setState((prevState) => {
      return { ...prevState, onlyDownloaded: checked }
    })
  }

  const handleLanguageChange = (value) => {
    compileTabLogic.setLanguage(value)
    state.autoCompile && compile()
    setState((prevState) => {
      return { ...prevState, language: value }
    })
  }

  const handleEvmVersionChange = (value) => {
    if (!value) return
    let v = value
    if (v === 'default') {
      v = null
    }
    compileTabLogic.setEvmVersion(v)
    state.autoCompile && compile()
    setState((prevState) => {
      return { ...prevState, evmVersion: value }
    })
  }

  const updatehhCompilation = (event) => {
    const checked = event.target.checked
    if (checked) setTruffleCompilation(false) // wayaround to reset the variable
    sethhCompilation(checked)
    api.setAppParameter('hardhat-compilation', checked)
  }

  const updateTruffleCompilation = (event) => {
    const checked = event.target.checked
    if (checked) sethhCompilation(false) // wayaround to reset the variable
    setTruffleCompilation(checked)
    api.setAppParameter('truffle-compilation', checked)
  }

  /*
    The following functions map with the above event handlers.
    They are an external API for modifying the compiler configuration.
  */
  const setConfiguration = (settings: ConfigurationSettings) => {
    handleLoadVersion(`soljson-v${settings.version}.js`)
    handleEvmVersionChange(settings.evmVersion)
    handleLanguageChange(settings.language)
    handleOptimizeChange(settings.optimize)
    onChangeRuns(settings.runs)
  }

  const toggleConfigurations = () => {
    setToggleExpander(!toggleExpander)
  }

  return (
    <section>
      <article>
        <div className="pt-0 px-4">
          <div className="mb-1">
            <label className="remixui_compilerLabel form-check-label" htmlFor="versionSelector">
              <FormattedMessage id="solidity.compiler" />
            </label>

            <CustomTooltip
              placement="bottom"
              tooltipId="promptCompilerTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id="solidity.addACustomCompilerWithURL" />}
            >
              <span className="fas fa-plus border-0 p-0 ml-3" onClick={() => promptCompiler()}></span>
            </CustomTooltip>
            <CustomTooltip
              placement="bottom"
              tooltipId="showCompilerTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id="solidity.seeCompilerLicense" />}
            >
              <span className="far fa-file-certificate border-0 p-0 ml-2" onClick={() => showCompilerLicense()}></span>
            </CustomTooltip>
            { solJsonBinData && solJsonBinData.selectorList && solJsonBinData.selectorList.length > 0 ? (
              <CompilerDropdown
                allversions={solJsonBinData.selectorList}
                customVersions={state.customVersions}
                selectedVersion={state.selectedVersion}
                defaultVersion={state.defaultVersion}
                handleLoadVersion={handleLoadVersion}
                _shouldBeAdded={_shouldBeAdded}
                onlyDownloaded={state.onlyDownloaded}
              ></CompilerDropdown>):null}
          </div>
          <div className="mb-2 flex-row-reverse d-flex flex-row custom-control custom-checkbox">
            <input className="mr-2 custom-control-input" id="nightlies" type="checkbox" onChange={handleNightliesChange} checked={state.includeNightlies} />
            <label htmlFor="nightlies" data-id="compilerNightliesBuild" className="pt-0 form-check-label custom-control-label">
              <FormattedMessage id="solidity.includeNightlyBuilds" />
            </label>
          </div>
          {platform === appPlatformTypes.desktop ?
            <div className="mb-2 flex-row-reverse d-flex flex-row custom-control custom-checkbox">
              <input className="mr-2 custom-control-input" id="downloadedcompilers" type="checkbox" onChange={handleOnlyDownloadedChange} checked={state.onlyDownloaded} />
              <label htmlFor="downloadedcompilers" data-id="compilerNightliesBuild" className="form-check-label custom-control-label">
                <FormattedMessage id="solidity.downloadedCompilers" />
              </label>
            </div>:null}
          <div className="mt-2 remixui_compilerConfig custom-control custom-checkbox">
            <input
              className="custom-control-input"
              type="checkbox"
              onChange={handleAutoCompile}
              data-id="compilerContainerAutoCompile"
              id="autoCompile"
              title="Auto compile"
              checked={state.autoCompile}
            />
            <label className="form-check-label custom-control-label" htmlFor="autoCompile">
              <FormattedMessage id="solidity.autoCompile" />
            </label>
          </div>
          <div className="mt-1 mb-2 remixui_compilerConfig custom-control custom-checkbox">
            <input
              className="custom-control-input"
              onChange={handleHideWarningsChange}
              id="hideWarningsBox"
              type="checkbox"
              title="Hide warnings"
              checked={state.hideWarnings}
            />
            <label className="form-check-label custom-control-label" htmlFor="hideWarningsBox">
              <FormattedMessage id="solidity.hideWarnings" />
            </label>
          </div>
          {isHardhatProject && (
            <div className="mt-3 remixui_compilerConfig custom-control custom-checkbox">
              <input
                className="custom-control-input"
                onChange={updatehhCompilation}
                id="enableHardhat"
                type="checkbox"
                title="Enable Hardhat Compilation"
                checked={hhCompilation}
              />
              <label className="form-check-label custom-control-label" htmlFor="enableHardhat">
                <FormattedMessage id="solidity.enableHardhat" />
              </label>
              <a className="mt-1 text-nowrap" href="https://remix-ide.readthedocs.io/en/latest/hardhat.html#enable-hardhat-compilation" target={'_blank'}>
                <CustomTooltip
                  placement={'right'}
                  tooltipClasses="text-nowrap"
                  tooltipId="overlay-tooltip-hardhat"
                  tooltipText={
                    <span className="border bg-light text-dark p-1 pr-3" style={{ minWidth: '230px' }}>
                      <FormattedMessage id="solidity.learnHardhat" />
                    </span>
                  }
                >
                  <i className={'ml-2 fas fa-info'} aria-hidden="true"></i>
                </CustomTooltip>
              </a>
            </div>
          )}
          {isTruffleProject && (
            <div className="mt-3 remixui_compilerConfig custom-control custom-checkbox">
              <input
                className="custom-control-input"
                onChange={updateTruffleCompilation}
                id="enableTruffle"
                type="checkbox"
                title="Enable Truffle Compilation"
                checked={truffleCompilation}
              />
              <label className="form-check-label custom-control-label" htmlFor="enableTruffle">
                <FormattedMessage id="solidity.enableTruffle" />
              </label>
              <a className="mt-1 text-nowrap" href="https://remix-ide.readthedocs.io/en/latest/truffle.html#enable-truffle-compilation" target={'_blank'}>
                <CustomTooltip
                  placement={'right'}
                  tooltipClasses="text-nowrap"
                  tooltipId="overlay-tooltip-truffle"
                  tooltipText={
                    <span className="border bg-light text-dark p-1 pr-3" style={{ minWidth: '230px' }}>
                      <FormattedMessage id="solidity.learnTruffle" />
                    </span>
                  }
                >
                  <i style={{ fontSize: 'medium' }} className={'ml-2 fas fa-info'} aria-hidden="true"></i>
                </CustomTooltip>
              </a>
            </div>
          )}
        </div>
        <div className="d-flex px-4 remixui_compilerConfigSection justify-content-between" onClick={toggleConfigurations}>
          <div className="d-flex">
            <label className="mt-1 remixui_compilerConfigSection">
              <FormattedMessage id="solidity.advancedConfigurations" />
            </label>
          </div>
          <div>
            <span data-id="scConfigExpander" onClick={toggleConfigurations}>
              <i className={!toggleExpander ? 'fas fa-angle-right' : 'fas fa-angle-down'} aria-hidden="true"></i>
            </span>
          </div>
        </div>
        <div className={`px-4 pb-4 border-bottom flex-column ${toggleExpander ? 'd-flex' : 'd-none'}`}>
          <div className="d-flex pb-1 remixui_compilerConfig custom-control custom-radio">
            <input
              className="custom-control-input"
              type="radio"
              name="configradio"
              value="manual"
              onChange={toggleConfigType}
              checked={!state.useFileConfiguration}
              id="scManualConfig"
            />
            <label className="form-check-label custom-control-label" htmlFor="scManualConfig" data-id="scManualConfiguration">
              <FormattedMessage id="solidity.compilerConfiguration" />
            </label>
          </div>
          <div className={`flex-column 'd-flex'}`}>
            <div className="mb-2 ml-4">
              <label className="remixui_compilerLabel form-check-label" htmlFor="compilerLanguageSelector">
                <FormattedMessage id="solidity.language" />
              </label>
              <CustomTooltip
                placement="right"
                tooltipId="compilerLabelTooltip"
                tooltipClasses="text-nowrap"
                tooltipText={
                  <span>
                    <FormattedMessage id="solidity.tooltipText6" />
                  </span>
                }
              >
                <div id="compilerLanguageSelectorWrapper">
                  <select
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={state.useFileConfiguration}
                    value={state.language}
                    className="custom-select"
                    id="compilerLanguageSelector"
                    style={{
                      pointerEvents: state.useFileConfiguration ? 'none' : 'auto'
                    }}
                  >
                    <option data-id={state.language === 'Solidity' ? 'selected' : ''} value="Solidity">
                      Solidity
                    </option>
                    <option data-id={state.language === 'Yul' ? 'selected' : ''} value="Yul">
                      Yul
                    </option>
                  </select>
                </div>
              </CustomTooltip>
            </div>
            <div className="mb-2 ml-4">
              <label className="remixui_compilerLabel form-check-label" htmlFor="evmVersionSelector">
                <FormattedMessage id="solidity.evmVersion" />
              </label>
              <select
                value={state.evmVersion}
                onChange={(e) => handleEvmVersionChange(e.target.value)}
                disabled={state.useFileConfiguration}
                className="custom-select"
                id="evmVersionSelector"
              >
                {compileTabLogic.evmVersions.map((version, index) => (
                  <option key={index} data-id={state.evmVersion === version ? 'selected' : ''} value={version}>
                    {version === 'default' ? `default (${compileTabLogic.evmVersions[index + 1]})` : version}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-1 mt-3 border-dark pb-3 ml-4 remixui_compilerConfig ">
              <div className="justify-content-between align-items-center d-flex">
                <CustomTooltip
                  placement="top"
                  tooltipId="configfileOptimisationNumbeTooltip"
                  tooltipClasses="text-nowrap"
                  tooltipText={(!state.optimize ? "Enable " : "Disable ") + "opcode-based optimizer for the generated bytecode and the Yul optimizer for the Yul code"}
                >
                  <div className='custom-control custom-checkbox'>
                    <input
                      onChange={(e) => {
                        handleOptimizeChange(e.target.checked)
                      }}
                      disabled={state.useFileConfiguration}
                      className="custom-control-input"
                      id="optimize"
                      type="checkbox"
                      checked={state.optimize}
                    />
                    <label className="form-check-label custom-control-label" htmlFor="optimize">
                      <FormattedMessage id="solidity.enableOptimization" />
                    </label>
                  </div>
                </CustomTooltip>
                <CustomTooltip
                  placement="top"
                  tooltipId="configfileOptimisationNumberTooltip"
                  tooltipClasses="text-nowrap"
                  tooltipText={intl.formatMessage({ id: 'solidity.inputTitle2' })}
                >
                  <input
                    min="1"
                    className="custom-select ml-2 remixui_runs"
                    id="runs"
                    placeholder="200"
                    value={state.runs}
                    type="number"
                    onChange={(e) => onChangeRuns(e.target.value)}
                    disabled={!state.optimize || state.useFileConfiguration}
                  />
                </CustomTooltip>
              </div>
            </div>
          </div>
          <div className="d-flex pb-1 remixui_compilerConfig custom-control custom-radio">
            <input
              className="custom-control-input"
              type="radio"
              name="configradio"
              value="file"
              onChange={toggleConfigType}
              checked={state.useFileConfiguration}
              id="scFileConfig"
            />
            <label className="form-check-label custom-control-label" htmlFor="scFileConfig" data-id="scFileConfiguration">
              <FormattedMessage id="solidity.useConfigurationFile" />
            </label>
          </div>
          <div className={`pt-2 ml-4 ml-2 align-items-start justify-content-between d-flex`}>
            {!showFilePathInput && state.useFileConfiguration && (
              <CustomTooltip
                placement="bottom"
                tooltipId="configfileTooltip"
                tooltipClasses="text-nowrap"
                tooltipText={
                  <span>
                    <FormattedMessage id="solidity.tooltipText4" />
                  </span>
                }
              >
                <span
                  onClick={
                    configFilePath === ''
                      ? () => {}
                      : async () => {
                        await openFile()
                      }
                  }
                  className="py-2 remixui_compilerConfigPath"
                >
                  {configFilePath === '' ? intl.formatMessage({ id: 'solidity.noFileSelected1' }) : configFilePath}
                </span>
              </CustomTooltip>
            )}
            {!showFilePathInput && !state.useFileConfiguration && <span className="py-2 text-secondary">{configFilePath}</span>}
            <input
              ref={configFilePathInput}
              className={`py-0 my-0 form-control ${showFilePathInput ? 'd-flex' : 'd-none'}`}
              placeholder={'/folder_path/file_name.json'}
              title={intl.formatMessage({ id: 'solidity.inputTitle1' })}
              disabled={!state.useFileConfiguration}
              data-id="scConfigFilePathInput"
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  handleConfigPathChange()
                }
              }}
            />
            {!showFilePathInput && (
              <button
                disabled={!state.useFileConfiguration}
                data-id="scConfigChangeFilePath"
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowFilePathInput(true)
                }}
              >
                <FormattedMessage id="solidity.change" />
              </button>
            )}
          </div>
        </div>
        <div className="px-4">
          <button
            id="compileBtn"
            data-id="compilerContainerCompileBtn"
            className="btn btn-primary btn-block d-block w-100 text-break remixui_disabled mb-1 mt-3"
            onClick={compile}
            disabled={(configFilePath === '' && state.useFileConfiguration) || disableCompileButton}
          >
            <CustomTooltip
              placement="auto"
              tooltipId="overlay-tooltip-compile"
              tooltipText={
                <div className="text-left">
                  {!(configFilePath === '' && state.useFileConfiguration) && (
                    <div>
                      <b>Ctrl+S</b> <FormattedMessage id="solidity.toCompile" /> {state.compiledFileName.endsWith('.sol') ? state.compiledFileName : null}{' '}
                    </div>
                  )}
                  {configFilePath === '' && state.useFileConfiguration && <div> <FormattedMessage id="solidity.noConfigFileSelected" /></div>}
                </div>
              }
            >
              <div className="d-flex align-items-center justify-content-center">
                {<i ref={compileIcon} className="fas fa-sync mr-2" aria-hidden="true"></i>}
                <div className="text-truncate overflow-hidden text-nowrap">
                  <span>
                    <FormattedMessage id="solidity.compile" />
                  </span>
                  <span className="ml-1 text-nowrap">
                    {typeof state.compiledFileName === 'string'
                      ? extractNameFromKey(state.compiledFileName) ||
                        `<${intl.formatMessage({
                          id: 'solidity.noFileSelected'
                        })}>`
                      : `<${intl.formatMessage({
                        id: 'solidity.noFileSelected'
                      })}>`}
                  </span>
                </div>
              </div>
            </CustomTooltip>
          </button>
          <div className="d-flex align-items-center">
            <button
              id="compileAndRunBtn"
              data-id="compilerContainerCompileAndRunBtn"
              className="btn btn-secondary btn-block d-block w-100 text-break  d-inline-block remixui_disabled mb-1 mt-1"
              onClick={compileAndRun}
              disabled={(configFilePath === '' && state.useFileConfiguration) || disableCompileButton}
            >
              <CustomTooltip
                placement={'auto-end'}
                tooltipId="overlay-tooltip-compile-run"
                tooltipText={
                  <div className="text-left">
                    {!(configFilePath === '' && state.useFileConfiguration) && (
                      <div>
                        <b>Ctrl+Shift+S</b> <FormattedMessage id="solidity.tooltipText3" />
                      </div>
                    )}
                    {configFilePath === '' && state.useFileConfiguration && <div> <FormattedMessage id="solidity.noConfigFileSelected" /></div>}
                  </div>
                }
              >
                <span>
                  <FormattedMessage id="solidity.compileAndRunScript" />
                </span>
              </CustomTooltip>
            </button>
            <CustomTooltip
              placement="top"
              tooltipId="overlay-tooltip-compile-run-doc"
              tooltipText={
                <div className="text-left p-2">
                  <div><FormattedMessage id="solidity.tooltipText1" /></div>
                  <pre>
                    <code>
                      /**
                      <br />
                      * @title ContractName
                      <br />
                      * @dev ContractDescription
                      <br />
                      * @custom:dev-run-script file_path
                      <br />
                      */
                      <br />
                      contract ContractName {'{}'}
                      <br />
                    </code>
                  </pre>
                  <FormattedMessage id="solidity.tooltipText2" />
                </div>
              }
            >
              <a href="https://remix-ide.readthedocs.io/en/latest/running_js_scripts.html#compile-a-contract-and-run-a-script-on-the-fly" target="_blank">
                <i className="pl-2 ml-2 fas fa-info text-dark"></i>
              </a>
            </CustomTooltip>
            <CopyToClipboard tip={intl.formatMessage({ id: 'solidity.copyNatSpecTag' })} getContent={() => '@custom:dev-run-script file_path'} direction="top">
              <button className="btn remixui_copyButton  ml-2 my-1 text-dark">
                <i className="remixui_copyIcon far fa-copy" aria-hidden="true"></i>
              </button>
            </CopyToClipboard>
          </div>
        </div>
      </article>
    </section>
  )
}

export default CompilerContainer
