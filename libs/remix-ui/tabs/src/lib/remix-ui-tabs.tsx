import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import './remix-ui-tabs.css'

/* eslint-disable-next-line */
export interface TabsUIProps {
 tabs: Array<any>
 onSelect: (index: number) => void
 onClose: (index: number) => void
 onZoomOut: () => void
 onZoomIn: () => void
 onReady: (api: any) => void
}

export interface TabsUIApi {
    activateTab: (namee: string) => void
    active: () => string
}

export const TabsUI = (props: TabsUIProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const currentIndexRef = useRef(-1)

  const renderTab = (tab, index) => {
    const classNameImg = 'my-1 mr-1 text-dark ' + tab.iconClass
    const classNameTab = 'nav-item nav-link tab' + (index === selectedIndex ? ' active' : '')
    return (
      <div className={classNameTab} title={tab.tooltip}>
        {tab.icon ? (<img className="my-1 mr-1 iconImage" src={tab.icon} />) : (<i className={classNameImg}></i>)}
        <span className="title-tabs">{tab.title}</span>
        <span className="close-tabs" onClick={() => props.onClose(index)}>
          <i className="text-dark fas fa-times"></i>
        </span>
      </div>
    )
  }

  const active = () => {
    return props.tabs[currentIndexRef.current].name
  }
  const activateTab = (name: string) => {
    const index = props.tabs.findIndex((tab) => tab.name === name)
    setSelectedIndex(index)
    currentIndexRef.current = index
  }
  useEffect(() => {
    props.onReady({
      activateTab,
      active
    })
  }, [])

  return (
    <div className="remix-ui-tabs header nav nav-tabs">
      <div className="d-flex flex-row justify-content-center align-items-center editor-zoom" title="Zoom in/out">
        <span data-id="tabProxyZoomOut" className="btn btn-sm px-1 fas fa-search-minus text-dark" onClick={() => props.onZoomOut()}></span>
        <span data-id="tabProxyZoomIn" className="btn btn-sm px-1 fas fa-search-plus text-dark" onClick={() => props.onZoomIn()}></span>
      </div>
      <i className="d-flex flex-row justify-content-center align-items-center far fa-sliders-v px-1 editor-f1" title="press F1 when focusing the editor to show advanced configuration settings"></i>
      <Tabs selectedIndex={selectedIndex} onSelect={index => { props.onSelect(index); setSelectedIndex(index); currentIndexRef.current = index }} >
        <TabList>{props.tabs.map((tab, i) => <Tab key={tab.name}>{renderTab(tab, i)}</Tab>)}</TabList>
        {props.tabs.map((tab) => <TabPanel key={tab.name} ></TabPanel>)}
      </Tabs>
    </div>
  )
}

export default TabsUI
