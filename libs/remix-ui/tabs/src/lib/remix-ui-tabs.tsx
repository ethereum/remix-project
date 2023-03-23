
import { fileDecoration, FileDecorationIcons } from '@remix-ui/file-decorators'
import { CustomTooltip } from '@remix-ui/helper'
import { Plugin } from '@remixproject/engine'
import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import './remix-ui-tabs.css'
const _paq = window._paq = window._paq || []


/* eslint-disable-next-line */
export interface TabsUIProps {
  tabs: Array<any>
  plugin: Plugin,
  onSelect: (index: number) => void
  onClose: (index: number) => void
  onZoomOut: () => void
  onZoomIn: () => void
  onReady: (api: any) => void
  themeQuality: string
}
export interface TabsUIApi {
  activateTab: (name: string) => void
  active: () => string
}
interface ITabsState {
  selectedIndex: number,
  fileDecorations: fileDecoration[],
  currentExt: string
}
interface ITabsAction {
  type: string,
  payload: any,
  ext?: string,
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
        selectedIndex: action.payload,
      }
    case 'SET_FILE_DECORATIONS':
      return {
        ...state,
        fileDecorations: action.payload as fileDecoration[],
      }
    default:
      return state
  }
}

export const TabsUI = (props: TabsUIProps) => {
  const [tabsState, dispatch] = useReducer(tabsReducer, initialTabsState);
  const currentIndexRef = useRef(-1)
  const tabsRef = useRef({})
  const tabsElement = useRef(null)

  const tabs = useRef(props.tabs)
  tabs.current = props.tabs // we do this to pass the tabs list to the onReady callbacks

  useEffect(() => {
    if (props.tabs[tabsState.selectedIndex]) {
      tabsRef.current[tabsState.selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [tabsState.selectedIndex])

  const getFileDecorationClasses = (tab: any) => {
    const fileDecoration = tabsState.fileDecorations.find((fileDecoration: fileDecoration) => {
      if(`${fileDecoration.workspace.name}/${fileDecoration.path}` === tab.name) return true
    })
    return fileDecoration && fileDecoration.fileStateLabelClass
  }

  const getFileDecorationIcons = (tab: any) => {
    return <FileDecorationIcons file={{path: tab.name}} fileDecorations={tabsState.fileDecorations} />
  }

   const renderTab = (tab, index) => {
    const classNameImg = 'my-1 mr-1 text-dark ' + tab.iconClass
    const classNameTab = 'nav-item nav-link d-flex justify-content-center align-items-center px-2 py-1 tab' + (index === currentIndexRef.current ? ' active' : '')
    const invert = props.themeQuality === 'dark' ? 'invert(1)' : 'invert(0)'

    return (
      <CustomTooltip
        tooltipId="tabsActive"
        tooltipText={tab.tooltip}
        placement="bottom-start"
      >
        <div
          ref={el => { tabsRef.current[index] = el }}
          className={classNameTab}
          data-id={index === currentIndexRef.current ? 'tab-active' : ''}
          data-path={tab.name}
        >
          {tab.icon ? (<img className="my-1 mr-1 iconImage" style={{ filter: invert }} src={tab.icon} />) : (<i className={classNameImg}></i>)}
          <span  className={`title-tabs ${getFileDecorationClasses(tab)}`}>{tab.title}</span>
          {getFileDecorationIcons(tab)}
          <span className="close-tabs" onClick={(event) => { props.onClose(index); event.stopPropagation() }}>
            <i className="text-dark fas fa-times"></i>
          </span>
        </div>
      </CustomTooltip>
    )
  }

  const active = () => {
    if (currentIndexRef.current < 0) return ''
    return tabs.current[currentIndexRef.current].name
  }

  const activateTab = (name: string) => {
    const index = tabs.current.findIndex((tab) => tab.name === name)
    currentIndexRef.current = index
    dispatch({ type: 'SELECT_INDEX', payload: index, ext: getExt(name)})
  }

  const setFileDecorations = (fileStates: fileDecoration[]) => {
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

    return () => { tabsElement.current.removeEventListener('wheel', transformScroll) }
  }, [])

  const getExt = (path) => {
    const root = path.split('#')[0].split('?')[0]
    const ext = root.indexOf('.') !== -1 ? /[^.]+$/.exec(root) : null
    if (ext) return ext[0].toLowerCase()
    else return ''
  }

  return (
    <div className="remix-ui-tabs d-flex justify-content-between border-0 header nav-tabs" data-id="tabs-component">
      <div className="d-flex flex-row" style={{ maxWidth: 'fit-content', width: '99%' }}>
        <div className="d-flex flex-row justify-content-center align-items-center m-1 mt-1">
          <button
            data-id='play-editor'
            className="btn text-success py-0"
            disabled={!(tabsState.currentExt === 'js' || tabsState.currentExt === 'ts' || tabsState.currentExt === 'sol')}
            onClick={async () => {
              const path = active().substr(active().indexOf('/') + 1, active().length)
              const content = await props.plugin.call('fileManager', "readFile", path)
              if (tabsState.currentExt === 'js' || tabsState.currentExt === 'ts') {
                await props.plugin.call('scriptRunner', 'execute', content, path)
                _paq.push(['trackEvent', 'editor', 'clickRunFromEditor', tabsState.currentExt])
              } else if (tabsState.currentExt === 'sol' || tabsState.currentExt === 'yul') {
                await props.plugin.call('solidity', 'compile', path)
                _paq.push(['trackEvent', 'editor', 'clickRunFromEditor', tabsState.currentExt])
              }
            }}
          >
            <CustomTooltip
              placement="bottom"
              tooltipId="overlay-tooltip-run-script"
              tooltipText={<span>
                  {(tabsState.currentExt === 'js' || tabsState.currentExt === 'ts') ? "Run script (CTRL + SHIFT + S)" :
                    tabsState.currentExt === 'sol' || tabsState.currentExt === 'yul'? "Compile CTRL + S" : "Select .sol or .yul file to compile or a .ts or .js file and run it"}
                </span>}
            >
              <i className="fad fa-play"></i>
            </CustomTooltip>
          </button>
          <CustomTooltip
            placement="bottom"
            tooltipId="overlay-tooltip-zoom-out"
            tooltipText="Zoom out"
          >
            <span data-id="tabProxyZoomOut" className="btn btn-sm px-2 fas fa-search-minus text-dark" onClick={() => props.onZoomOut()}></span>
          </CustomTooltip>
          <CustomTooltip
            placement="bottom"
            tooltipId="overlay-tooltip-run-zoom-in"
            tooltipText="Zoom in"
          >
            <span data-id="tabProxyZoomIn" className="btn btn-sm px-2 fas fa-search-plus text-dark" onClick={() => props.onZoomIn()}></span>
          </CustomTooltip>
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
            dispatch({ type: 'SELECT_INDEX', payload: index, ext: getExt(props.tabs[currentIndexRef.current].name)})
          }}
        >
          <TabList className="d-flex flex-row align-items-center">
            {props.tabs.map((tab, i) => <Tab className="" key={tab.name}>{renderTab(tab, i)}</Tab>)}
            <div style={{minWidth: '4rem', height: "1rem"}} id="dummyElForLastXVisibility"></div>
          </TabList>
          {props.tabs.map((tab) => <TabPanel key={tab.name} ></TabPanel>)}
        </Tabs>
      </div>
    </div>
  )
}

export default TabsUI
