import { fileDecoration, FileDecorationIcons } from '@remix-ui/file-decorators'
import { CustomTooltip } from '@remix-ui/helper'
import { Plugin } from '@remixproject/engine'
import React, { useState, useRef, useEffect, useReducer, useContext } from 'react' // eslint-disable-line
import { FormattedMessage } from 'react-intl'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import './remix-ui-tabs.css'
import { values } from 'lodash'
import { AppContext } from '@remix-ui/app'
import { desktopConnectionType } from '@remix-api'
import { CompileDropdown, RunScriptDropdown } from '@remix-ui/tabs'

const _paq = (window._paq = window._paq || [])

/* eslint-disable-next-line */
export interface TabsUIProps {
  tabs: Array<Tab>
  plugin: Plugin
  onSelect: (index: number) => void
  onClose: (index: number) => void
  onZoomOut: () => void
  onZoomIn: () => void
  onReady: (api: any) => void
  themeQuality: string
}

export interface Tab {
  id: string
  icon: string
  iconClass: string
  name: string
  title: string
  tooltip: string
}
export interface TabsUIApi {
  activateTab: (name: string) => void
  active: () => string
}
interface ITabsState {
  selectedIndex: number
  fileDecorations: fileDecoration[]
  currentExt: string
}
interface ITabsAction {
  type: string
  payload: any
  ext?: string
}

const initialTabsState: ITabsState = {
  selectedIndex: -1,
  fileDecorations: [],
  currentExt: ''
}

const tabsReducer = (state: ITabsState, action: ITabsAction) => {
  switch (action.type) {
  case 'SELECT_INDEX':
    return {
      ...state,
      currentExt: action.ext,
      selectedIndex: action.payload
    }
  case 'SET_FILE_DECORATIONS':
    return {
      ...state,
      fileDecorations: action.payload as fileDecoration[]
    }
  default:
    return state
  }
}
const PlayExtList = ['js', 'ts', 'sol', 'circom', 'vy', 'nr']

export const TabsUI = (props: TabsUIProps) => {

  const [tabsState, dispatch] = useReducer(tabsReducer, initialTabsState)
  const currentIndexRef = useRef(-1)
  const tabsRef = useRef({})
  const tabsElement = useRef(null)
  const [ai_switch, setAI_switch] = useState<boolean>(true)
  const tabs = useRef(props.tabs)
  tabs.current = props.tabs // we do this to pass the tabs list to the onReady callbacks
  const appContext = useContext(AppContext)

  const [compileState, setCompileState] = useState<'idle' | 'compiling' | 'compiled'>('idle')

  useEffect(() => {
    if (props.tabs[tabsState.selectedIndex]) {
      tabsRef.current[tabsState.selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [tabsState.selectedIndex])

  // Toggle the copilot in editor when clicked to update in status bar
  useEffect(() => {
    const run = async () => {
      props.plugin.on('settings', 'copilotChoiceUpdated', async (isChecked) => {
        setAI_switch(isChecked)
      })
    }
    if (tabsState.currentExt === 'sol') run()
  }, [tabsState.currentExt])

  const getAI = async () => {
    try {
      const init_state = await props.plugin.call('settings', 'getCopilotSetting')
      if (init_state === undefined || init_state === null) {
        await props.plugin.call('settings', 'updateCopilotChoice', ai_switch)
        return ai_switch
      }
      return init_state
    } catch (e) {
      return false
    }
  }

  const getFileDecorationClasses = (tab: any) => {
    const fileDecoration = tabsState.fileDecorations.find((fileDecoration: fileDecoration) => {
      if (`${fileDecoration.workspace.name}/${fileDecoration.path}` === tab.name) return true
    })
    return fileDecoration && fileDecoration.fileStateLabelClass
  }

  const getFileDecorationIcons = (tab: any) => {
    return <FileDecorationIcons file={{ path: tab.name }} fileDecorations={tabsState.fileDecorations} />
  }

  const renderTab = (tab: Tab, index) => {
    const classNameImg = 'my-1 mr-1 text-dark ' + tab.iconClass
    const classNameTab = 'nav-item nav-link d-flex justify-content-center align-items-center px-2 py-1 tab' + (index === currentIndexRef.current ? ' active' : '')
    const invert = props.themeQuality === 'dark' ? 'invert(1)' : 'invert(0)'
    return (
      <CustomTooltip tooltipId="tabsActive" tooltipText={tab.tooltip} placement="bottom-start">
        <div
          ref={(el) => {
            tabsRef.current[index] = el
          }}
          className={classNameTab}
          data-id={index === currentIndexRef.current ? 'tab-active' : ''}
          data-path={tab.name}
        >
          {tab.icon ? <img className="my-1 mr-1 iconImage" src={tab.icon} /> : <i className={classNameImg}></i>}
          <span className={`title-tabs ${getFileDecorationClasses(tab)}`}>{tab.title}</span>
          {getFileDecorationIcons(tab)}
          <span
            className="close-tabs"
            data-id={`close_${tab.name}`}
            onClick={(event) => {
              props.onClose(index)
              event.stopPropagation()
            }}
          >
            <i className="text-dark fas fa-times"></i>
          </span>
        </div>
      </CustomTooltip>
    )
  }

  const active = () => {
    if (currentIndexRef.current < 0) return ''
    if (!tabs.current[currentIndexRef.current]) return ''
    return tabs.current[currentIndexRef.current].name
  }

  const activateTab = (name: string) => {
    const index = tabs.current.findIndex((tab) => tab.name === name)
    currentIndexRef.current = index
    dispatch({ type: 'SELECT_INDEX', payload: index, ext: getExt(name) })
  }

  const setFileDecorations = (fileStates: fileDecoration[]) => {
    getAI().then(value => setAI_switch(value)).catch(error => console.log(error))
    dispatch({ type: 'SET_FILE_DECORATIONS', payload: fileStates })
  }

  const transformScroll = (event) => {
    if (!event.deltaY) {
      return
    }

    event.currentTarget.scrollLeft += event.deltaY + event.deltaX
    event.preventDefault()
  }

  useEffect(() => {
    props.onReady({
      activateTab,
      active,
      setFileDecorations
    })
    return () => {
      tabsElement.current.removeEventListener('wheel', transformScroll)
    }
  }, [])

  const getExt = (path) => {
    const root = path.split('#')[0].split('?')[0]
    const ext = root.indexOf('.') !== -1 ? /[^.]+$/.exec(root) : null
    if (ext) return ext[0].toLowerCase()
    else return ''
  }

  useEffect(() => {
    setCompileState('idle')
  }, [tabsState.selectedIndex])

  const handleCompileAndPublish = async (storageType: 'ipfs' | 'swarm') => {
    setCompileState('compiling')
    await props.plugin.call('notification', 'toast', `Switching to Solidity Compiler to publish...`)

    await props.plugin.call('manager', 'activatePlugin', 'solidity')
    await props.plugin.call('menuicons', 'select', 'solidity')
    try {
      await props.plugin.call('solidity', 'compile', active().substr(active().indexOf('/') + 1, active().length))
      _paq.push(['trackEvent', 'editor', 'publishFromEditor', storageType])

      setTimeout(() => {
        let buttonId
        if (storageType === 'ipfs') {
          buttonId = 'publishOnIpfs'
        } else {
          buttonId = 'publishOnSwarm'
        }

        const buttonToClick = document.getElementById(buttonId)

        if (buttonToClick) {
          buttonToClick.click()
        } else {
          props.plugin.call('notification', 'toast', 'Could not find the publish button.')
        }
      }, 500)

    } catch (e) {
      console.error(e)
      await props.plugin.call('notification', 'toast', `Error publishing: ${e.message}`)
    }

    setCompileState('idle')
  }

  const handleRunScript = async (runnerKey: string) => {
    if (runnerKey === 'new_script') {
      try {
        const path = 'scripts'
        let newScriptPath = `${path}/new_script.ts`
        let counter = 1

        while (await props.plugin.call('fileManager', 'exists', newScriptPath)) {
          newScriptPath = `${path}/new_script_${counter}.ts`
          counter++
        }

        const boilerplateContent = `// This script can be used to deploy and interact with your contracts.
//
// See the Remix documentation for more examples:
// https://remix-ide.readthedocs.io/en/latest/running_js_scripts.html

(async () => {
    try {
        console.log('Running script...')
    } catch (e) {
        console.error(e.message)
    }
})()`

        await props.plugin.call('fileManager', 'writeFile', newScriptPath, boilerplateContent)
        _paq.push(['trackEvent', 'editor', 'runScript', 'new_script'])
      } catch (e) {
        console.error(e)
        props.plugin.call('notification', 'toast', `Error creating new script: ${e.message}`)
      }
      return
    }

    const path = active().substr(active().indexOf('/') + 1)
    if (!path || !PlayExtList.includes(getExt(path))) {
      props.plugin.call('notification', 'toast', 'A runnable file (.js, .ts) must be selected.')
      return
    }

    try {
      setCompileState('compiling')

      const configurations = await props.plugin.call('scriptRunnerBridge', 'getConfigurations')

      const selectedConfig = configurations.find(c => c.name === runnerKey)
      if (!selectedConfig) {
        throw new Error(`Runner configuration "${runnerKey}" not found.`)
      }

      await props.plugin.call('scriptRunnerBridge', 'selectScriptRunner', selectedConfig)

      const content = await props.plugin.call('fileManager', 'readFile', path)
      await props.plugin.call('scriptRunnerBridge', 'execute', content, path)

      setCompileState('compiled')
      _paq.push(['trackEvent', 'editor', 'runScriptWithEnv', runnerKey])
    } catch (e) {
      console.error(e)
      props.plugin.call('notification', 'toast', `Error running script: ${e.message}`)
      setCompileState('idle')
    }
  }

  const handleCompileClick = async () => {
    setCompileState('compiling')
    _paq.push(['trackEvent', 'editor', 'clickRunFromEditor', tabsState.currentExt])

    try {
      const path = active().substr(active().indexOf('/') + 1, active().length)

      if (tabsState.currentExt === 'js' || tabsState.currentExt === 'ts') {
        const content = await props.plugin.call('fileManager', 'readFile', path)
        await props.plugin.call('scriptRunnerBridge', 'execute', content, path)
        setCompileState('compiled')
        return
      }

      const compilerName = {
        sol: 'solidity',
        yul: 'solidity',
        vy: 'vyper',
        circom: 'circuit-compiler',
        nr: 'noir-compiler'
      }[tabsState.currentExt]

      if (!compilerName) {
        setCompileState('idle')
        return
      }

      props.plugin.once(compilerName, 'compilationFinished', (fileName, source, languageVersion, data) => {
        const hasErrors = data.errors && data.errors.filter(e => e.severity === 'error').length > 0

        if (hasErrors) {
          setCompileState('idle')
        } else {
          setCompileState('compiled')
        }
      })

      if (tabsState.currentExt === 'vy') {
        await props.plugin.call(compilerName, 'vyperCompileCustomAction')
      } else {
        await props.plugin.call(compilerName, 'compile', path)
      }
    } catch (e) {
      console.error(e)
      setCompileState('idle')
    }
  }

  return (
    <div
      className={`remix-ui-tabs justify-content-between border-0 header nav-tabs ${
        appContext.appState.connectedToDesktop === desktopConnectionType .disabled ? 'd-flex' : 'd-none'
      }`}
      data-id="tabs-component"
    >
      <div className="d-flex flex-row" style={{ maxWidth: 'fit-content', width: '99%' }}>
        <div className="d-flex flex-row justify-content-center align-items-center m-1 mt-1">
          <div className="d-flex align-items-center m-1">
            <div className="btn-group" role="group" data-id="compile_group" aria-label="compile group">
              <CustomTooltip
                placement="bottom"
                tooltipId="overlay-tooltip-run-script"
                tooltipText={
                  <span>
                    {tabsState.currentExt === 'js' || tabsState.currentExt === 'ts' ? (
                      <FormattedMessage id="remixUiTabs.tooltipText1" />
                    ) : tabsState.currentExt === 'sol' || tabsState.currentExt === 'yul' || tabsState.currentExt === 'circom' || tabsState.currentExt === 'vy' ? (
                      <FormattedMessage id="remixUiTabs.tooltipText2" />
                    ) : (
                      <FormattedMessage id="remixUiTabs.tooltipText3" />
                    )}
                  </span>
                }
              >
                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center"
                  data-id="compile-action"
                  style={{
                    padding: "4px 8px",
                    height: "28px",
                    fontFamily: "Nunito Sans, sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    lineHeight: "14px",
                    whiteSpace: "nowrap",
                    borderRadius: "4px 0 0 4px"
                  }}
                  disabled={!(PlayExtList.includes(tabsState.currentExt)) || compileState === 'compiling'}
                  onClick={handleCompileClick}
                >
                  <i className={
                    compileState === 'compiled' ? "fas fa-check"
                      : "fas fa-play"
                  }></i>
                  <span className="ml-2" style={{ lineHeight: "12px", position: "relative", top: "1px" }}>
                    {(tabsState.currentExt === 'js' || tabsState.currentExt === 'ts')
                      ? (compileState === 'compiling' ? "Run script" :
                        compileState === 'compiled' ? "Run script" : "Run script")
                      : (compileState === 'compiling' ? "Compiling..." :
                        compileState === 'compiled' ? "Compiled" : "Compile")}
                  </span>
                </button>
              </CustomTooltip>
            </div>
            {(tabsState.currentExt === 'js' || tabsState.currentExt === 'ts') ? (
              <RunScriptDropdown
                plugin={props.plugin}
                onRun={handleRunScript}
                onNotify={(msg) => console.log(msg)}
                disabled={!(PlayExtList.includes(tabsState.currentExt)) || compileState === 'compiling'}
              />
            ) : (
              <>
                <CompileDropdown
                  tabPath={active().substr(active().indexOf('/') + 1, active().length)}
                  compiledFileName={active()}
                  plugin={props.plugin}
                  disabled={!(PlayExtList.includes(tabsState.currentExt)) || compileState === 'compiling'}
                  onNotify={(msg) => console.log(msg)}
                  onRequestCompileAndPublish={handleCompileAndPublish}
                  setCompileState={setCompileState}
                />
              </>
            )}
          </div>

          <div className="d-flex border-left ml-2 align-items-center" style={{ height: "3em" }}>
            <CustomTooltip placement="bottom" tooltipId="overlay-tooltip-zoom-out" tooltipText={<FormattedMessage id="remixUiTabs.zoomOut" />}>
              <span data-id="tabProxyZoomOut" className="btn fas fa-search-minus text-dark pl-2 pr-0 py-0 d-flex" onClick={() => props.onZoomOut()}></span>
            </CustomTooltip>
            <CustomTooltip placement="bottom" tooltipId="overlay-tooltip-run-zoom-in" tooltipText={<FormattedMessage id="remixUiTabs.zoomIn" />}>
              <span data-id="tabProxyZoomIn" className="btn fas fa-search-plus text-dark pl-2 pr-0 py-0 d-flex" onClick={() => props.onZoomIn()}></span>
            </CustomTooltip>
          </div>
        </div>
        <Tabs
          className="tab-scroll"
          selectedIndex={tabsState.selectedIndex}
          domRef={(domEl) => {
            if (tabsElement.current) return
            tabsElement.current = domEl
            tabsElement.current.addEventListener('wheel', transformScroll)
          }}
          onSelect={(index) => {
            props.onSelect(index)
            currentIndexRef.current = index
            dispatch({
              type: 'SELECT_INDEX',
              payload: index,
              ext: getExt(props.tabs[currentIndexRef.current].name)
            })
            setCompileState('idle')
          }}
        >
          <TabList className="d-flex flex-row align-items-center">
            {props.tabs.map((tab, i) => (
              <Tab className="" key={tab.name} data-id={tab.id}>
                {renderTab(tab, i)}
              </Tab>
            ))}
            <div style={{ minWidth: '4rem', height: '1rem' }} id="dummyElForLastXVisibility"></div>
          </TabList>
          {props.tabs.map((tab) => (
            <TabPanel key={tab.name}></TabPanel>
          ))}
        </Tabs>
      </div>

    </div>
  )
}

export default TabsUI
