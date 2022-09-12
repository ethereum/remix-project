
import { fileDecoration, FileDecorationIcons } from '@remix-ui/file-decorators'
import { Plugin } from '@remixproject/engine'
import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import { OverlayTrigger, Tooltip } from 'react-bootstrap' // eslint-disable-line
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import './remix-ui-tabs.css'

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
      <div ref={el => { tabsRef.current[index] = el }} className={classNameTab} data-id={index === currentIndexRef.current ? 'tab-active' : ''} title={tab.tooltip}>
        {tab.icon ? (<img className="my-1 mr-1 iconImage" style={{ filter: invert }} src={tab.icon} />) : (<i className={classNameImg}></i>)}
        <span className={`title-tabs ${getFileDecorationClasses(tab)}`}>{tab.title}</span>
        {getFileDecorationIcons(tab)}
        <span className="close-tabs" onClick={(event) => { props.onClose(index); event.stopPropagation() }}>
          <i className="text-dark fas fa-times"></i>
        </span>
      </div>
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
    if (ext) return ext[0]
    else return ''
  }

  return (
    <div className="remix-ui-tabs d-flex justify-content-between border-0 header nav-tabs" data-id="tabs-component">
      <div className="d-flex flex-row" style={{ maxWidth: 'fit-content', width: '97%' }}>
        <div className="d-flex flex-row justify-content-center align-items-center m-1 mt-1">
          <button
            className="btn text-success py-0"
            disabled={!(tabsState.currentExt === 'js' || tabsState.currentExt === 'ts' || tabsState.currentExt === 'sol')}
            onClick={async () => {
              const path = active().substr(active().indexOf('/') + 1, active().length)
              const content = await props.plugin.call('fileManager', "readFile", path)
              if (tabsState.currentExt === 'js' || tabsState.currentExt === 'ts') {
                await props.plugin.call('scriptRunner', 'execute', content)
              } else if (tabsState.currentExt === 'sol') {
                await props.plugin.call('solidity', 'compile', path)
              }
            }}
          >
            <OverlayTrigger placement="bottom" overlay={
              <Tooltip id="overlay-tooltip-run-script">
                <span>
                  {(tabsState.currentExt === 'js' || tabsState.currentExt === 'ts') ? "Run script (CTRL + SHIFT + S)" :
                    tabsState.currentExt === 'sol' ? "Compile CTRL + S" : "Select .sol file to compile or a .ts or .js file and run it"}
                </span>
              </Tooltip>
            }>
              <i className="fad fa-play"></i>
            </OverlayTrigger>
          </button>
          <span data-id="tabProxyZoomOut" className="btn btn-sm px-2 fas fa-search-minus text-dark" title="Zoom out" onClick={() => props.onZoomOut()}></span>
          <span data-id="tabProxyZoomIn" className="btn btn-sm px-2 fas fa-search-plus text-dark" title="Zoom in" onClick={() => props.onZoomIn()}></span>
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
            {props.tabs.map((tab, i) => <Tab className="py-1" key={tab.name}>{renderTab(tab, i)}</Tab>)}
          </TabList>
          {props.tabs.map((tab) => <TabPanel key={tab.name} ></TabPanel>)}
        </Tabs>
      </div>
      <i className="mt-2 mr-2 fas fa-arrows-alt-h" title="Scroll to see all tabs"></i>
    </div>
  )
}

export default TabsUI
