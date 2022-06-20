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
 themeQuality: string
}

export interface TabsUIApi {
    activateTab: (namee: string) => void
    active: () => string
}

export const TabsUI = (props: TabsUIProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const currentIndexRef = useRef(-1)
  const tabsRef = useRef({})
  const tabsElement = useRef(null)

  const tabs = useRef(props.tabs)
  tabs.current = props.tabs // we do this to pass the tabs list to the onReady callbacks

  useEffect(() => {
    if (props.tabs[selectedIndex]) {
      tabsRef.current[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedIndex])

  const renderTab = (tab, index) => {
    const classNameImg = 'my-1 mr-1 text-dark ' + tab.iconClass
    const classNameTab = 'nav-item nav-link d-flex justify-content-center align-items-center px-2 py-1 tab' + (index === currentIndexRef.current ? ' active' : '')
    const invert = props.themeQuality === 'dark' ? 'invert(1)' : 'invert(0)'

    return (
      <div ref={el => { tabsRef.current[index] = el }} className={classNameTab} data-id={index === currentIndexRef.current ? 'tab-active' : ''} title={tab.tooltip}>
        {tab.icon ? (<img className="my-1 mr-1 iconImage" style={{filter: invert}} src={tab.icon} />) : (<i className={classNameImg}></i>)}
        <span className="title-tabs">{tab.title}</span>
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
    setSelectedIndex(index)
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
      active
    })
    return () => { tabsElement.current.removeEventListener('wheel', transformScroll) }
  }, [])

  return (
    <div className="remix-ui-tabs d-flex justify-content-between border-0 header nav-tabs" data-id="tabs-component">
      <div className="d-flex flex-row" style={ { maxWidth: 'fit-content', width: '97%' } }>
        <div className="d-flex flex-row justify-content-center align-items-center m-1 mt-2">
          <span data-id="tabProxyZoomOut" className="btn btn-sm px-2 fas fa-search-minus text-dark" title="Zoom out" onClick={() => props.onZoomOut()}></span>
          <span data-id="tabProxyZoomIn" className="btn btn-sm px-2 fas fa-search-plus text-dark" title="Zoom in" onClick={() => props.onZoomIn()}></span>
        </div>
        <Tabs
          className="tab-scroll"
          selectedIndex={selectedIndex}
          domRef={(domEl) => {
            if (tabsElement.current) return
            tabsElement.current = domEl
            tabsElement.current.addEventListener('wheel', transformScroll)
          }}
          onSelect={(index) => {
            props.onSelect(index)
            currentIndexRef.current = index
            setSelectedIndex(index)
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
