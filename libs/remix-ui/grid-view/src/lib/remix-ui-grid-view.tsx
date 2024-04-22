import React, {useState, useEffect, useContext, useRef, ReactNode} from 'react' // eslint-disable-line

import './remix-ui-grid-view.css'
import {ThemeContext, themes} from './themeContext'
import CustomCheckbox from './components/customCheckbox'
import FiltersContext from "./filtersContext"

declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || []

interface RemixUIGridViewProps {
  plugin: any
  logo?: string
  title?: string
  enableFilter?: boolean
  tagList?: [string, string][] // max 8, others will be ignored
  showUntagged?: boolean
  showPin?: boolean
  classList?: string
  styleList?: any
  description?: string
  children?: ReactNode
}

export const RemixUIGridView = (props: RemixUIGridViewProps) => {
  const [keyValueMap, setKeyValueMap] = useState<Record<string, { enabled: boolean; color: string; }>>({});

  const showUntagged = props.showUntagged || false
  const showPin = props.showPin || false
  const updateValue = (key: string, enabled: boolean, color?: string) => {
    if (!color || color === '') color = setKeyValueMap[key].color
    setKeyValueMap((prevMap) => ({
      ...prevMap,
      [key]: {color, enabled},
    }))
  }

  const addValue = (key: string, enabled: boolean, color: string) => {
    // Check if the key already exists, if so, do not add
    if (key in keyValueMap) {
      return
    }

    // Add the new key-value pair
    setKeyValueMap((prevMap) => ({
      ...prevMap,
      [key]: { enabled, color },
    }))
  }

  const {plugin} = props.plugin
  const searchInputRef = useRef(null)

  const [state, setState] = useState<{
    themeQuality: {filter: string; name: string}
  }>({
    themeQuality: themes.light
  })

  // Initialize filters context with data from props
  useEffect(() => {
    if (props.tagList && Array.isArray(props.tagList)) {
      const initialKeyValueMap: Record<string, { enabled: boolean; color: string; }> = {};
    
      // Limit to first 8 elements, ignoring the rest
      for (let i = 0; i < props.tagList.length; i++) {
        const [key, color] = props.tagList[i]
        initialKeyValueMap[key] = { enabled: true, color } 
      }
      if (showUntagged) initialKeyValueMap['no tag'] = { enabled: true, color: 'primary' } 
      setKeyValueMap(initialKeyValueMap)
    }
  }, [])

  useEffect(() => {
    plugin?.call('theme', 'currentTheme').then((theme) => {
      // update theme quality. To be used for for images
      setState((prevState) => {
        return {
          ...prevState,
          themeQuality: theme.quality === 'dark' ? themes.dark : themes.light
        }
      })
    })
    plugin?.on('theme', 'themeChanged', (theme) => {
      // update theme quality. To be used for for images
      setState((prevState) => {
        return {
          ...prevState,
          themeQuality: theme.quality === 'dark' ? themes.dark : themes.light
        }
      })
    })
  }, [plugin])

  return (
    <FiltersContext.Provider value={{ showUntagged, showPin, keyValueMap, updateValue, addValue }}>
      <div className={"d-flex flex-column bg-dark w-100 h-100 remixui_grid_view_container " + props.classList || ''} data-id="remixUIGV">
        <ThemeContext.Provider value={state.themeQuality}>
          <div className="d-flex flex-column w-100 remixui_grid_view">
            <div className='d-flex p-4 bg-light flex-column  remixui_grid_view_titlebar'>
              <div className='d-flex flex-row align-items-center mb-2'>
                { props.logo && <img className='remixui_grid_view_logo mr-2' src={props.logo} /> }
                { props.title && <h3 className='mb-0'>{ props.title }</h3> }
              </div>
              { props.description && <div className='pb-3 remixui_grid_view_title'>{ props.description }</div> }
              { props.enableFilter && <div className='d-flex flex-row'>
                <div className="d-flex flex-row pr-2 pb-1 align-items-center justify-content-between">
                  <div className='d-flex' id="GVFilter">
                    <button
                      className="remixui_grid_view_btn text-secondary form-control bg-light border d-flex align-items-center p-2 justify-content-center fas fa-filter bg-light"
                      onClick={(e) => {
                        _paq.push(['trackEvent', 'GridView' + props.title ? props.title : '', 'filter', searchInputRef.current.value])
                        //setstate
                      }}
                    ></button>
                    <input
                      ref={searchInputRef}
                      type="text"
                      style={{minWidth: '100px'}}
                      className="border form-control border-right-0 mr-4"
                      id="GVFilterInput"
                      placeholder={"Filter the list"}
                      data-id="RemixGVFilterInput"
                    />
                  </div>
                  <div className='d-flex flex-row'>
                    { Object.keys(keyValueMap).map((key) => (
                      <CustomCheckbox label={key} />
                    )) }
                  </div>
                </div>
              </div> }
            </div>
            { props.children }
          </div>
        </ThemeContext.Provider>
      </div>
    </FiltersContext.Provider>
  )
}

export default RemixUIGridView
