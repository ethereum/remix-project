import React, {useState, useEffect, useContext, useRef, ReactNode} from 'react' // eslint-disable-line

import './remix-ui-grid-section.css'
import {ThemeContext, themes} from './themeContext'

declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || []

interface RemixUIGridSectionProps {
  plugin: any
  title?: string
  hScrollable: boolean
  classList?: string
  styleList?: any
  children?: ReactNode
}

export const RemixUIGridSection = (props: RemixUIGridSectionProps) => {
  const {plugin} = props.plugin
  const searchInputRef = useRef(null)

  console.log('props.hScrollable ', props.hScrollable)
  const [state, setState] = useState<{
    themeQuality: {filter: string; name: string}
  }>({
    themeQuality: themes.light
  })

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
    <div
      className={`d-flex px-4 py-2 flex-column w-100 remixui_grid_section_container ${props.classList}`}
      data-id={"remixUIGS" + props.title}
      style={{ overflowX: 'auto' }}
    >
      <div className="d-flex flex-column w-100 remixui_grid_section">
        { props.title && <h6 className='mt-1 mb-0 align-items-left '>{ props.title }</h6> }
        <div className={(props.hScrollable) ? `d-flex flex-row pb-2  overflow-auto` : `d-flex flex-wrap`}>
          { props.children }
        </div>
      </div>
    </div>
  )
}

export default RemixUIGridSection
