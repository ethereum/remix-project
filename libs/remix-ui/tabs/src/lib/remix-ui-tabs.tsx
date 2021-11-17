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
  const tabsRef = useRef({})
  let mutex = false

  const tabs = useRef(props.tabs)
  const tabsScrollable = useRef(null)
  tabs.current = props.tabs // we do this to pass the tabs list to the onReady callbacks

  useEffect(() => {
    if (props.tabs[selectedIndex]) {
      tabsRef.current[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
      console.log("usesc")
    }
  }, [selectedIndex])

  const renderTab = (tab, index) => {
    const classNameImg = 'my-1 mr-1 text-dark ' + tab.iconClass
    const classNameTab = 'nav-item nav-link d-flex justify-content-center align-items-center px-2 py-1 tab' + (index === currentIndexRef.current ? ' active' : '')
    return (
      <div onClick={() => { props.onSelect(index); currentIndexRef.current = index; setSelectedIndex(index) }} ref={el => { tabsRef.current[index] = el }} className={classNameTab} title={tab.tooltip}>
        {tab.icon ? (<img className="my-1 mr-1 iconImage" src={tab.icon} />) : (<i className={classNameImg}></i>)}
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
  const isCompletelyVisible = (el) => {
    const rectTab = el.getBoundingClientRect()
    const rectTabs = tabsScrollable.current.getBoundingClientRect()
    // Only completely visible elements return true:
    return (rectTab.left >= 0) &&
      rectTab.left > rectTabs.left &&
      rectTab.left < rectTabs.right
  }
  const scrollToNextTab = (event) => {
    if (mutex) return
    mutex = true
    const next = event.deltaY > 0
    if (next) {
      // scroll to previous
      let firstVisibleIndex = Object.values(tabsRef.current).findIndex((element) => { return isCompletelyVisible(element) })
      if (firstVisibleIndex > -1) {
        if (firstVisibleIndex > 0) firstVisibleIndex -= 1
        tabsRef.current[firstVisibleIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
        console.log('scroll_N ', firstVisibleIndex)
      }
    } else {
      // scroll to next
      let lastVisibleIndex: number = props.tabs.length - 1 - Object.values(tabsRef.current).reverse().findIndex((element) => { return isCompletelyVisible(element) })
      if (lastVisibleIndex > -1) {
        if (lastVisibleIndex < props.tabs.length - 2) lastVisibleIndex += 1
        tabsRef.current[lastVisibleIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
        console.log('scroll_P ', lastVisibleIndex)
      }
    }
    mutex = false
  }

  useEffect(() => {
    props.onReady({
      activateTab,
      active
    })
    window.addEventListener('wheel', scrollToNextTab)
    return () => { window.removeEventListener('wheel', scrollToNextTab) }
  }, [])

  return (
    <div className="remix-ui-tabs d-flex justify-content-between border-0 header nav-tabs">
      <div ref={tabsScrollable} className="d-flex flex-row" style={ { maxWidth: 'fit-content', width: '97%' } }>
        <div className="d-flex flex-row justify-content-center align-items-center m-1 mt-2">
          <span data-id="tabProxyZoomOut" className="btn btn-sm px-2 fas fa-search-minus text-dark" title="Zoom out" onClick={() => props.onZoomOut()}></span>
          <span data-id="tabProxyZoomIn" className="btn btn-sm px-2 fas fa-search-plus text-dark" title="Zoom in" onClick={() => props.onZoomIn()}></span>
        </div>
        <Tabs
          className="tab-scroll"
          selectedIndex={selectedIndex}
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
//       { (props.tabs.length > 2 && (isCompletelyVisible(tabsRef.current[0]) || isCompletelyVisible(tabsRef.current[props.tabs.length - 1]))) &&
