import React, {useState, useEffect, useContext, useRef, ReactNode, ReactHTMLElement} from 'react' // eslint-disable-line

import './remix-ui-grid-cell.css'
import FiltersContext from "./filtersContext"
import { CustomTooltip } from '@remix-ui/helper'

declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || []

interface RemixUIGridCellProps {
  plugin: any
  pinned?: boolean
  pinStateCallback?: any
  logo?: string
  title: string
  tagList?: string[] // max 8, others will be ignored
  classList?: string
  styleList?: any
  children?: ReactNode
  expandViewEl?: any
  handleExpand?: any
}

export const RemixUIGridCell = (props: RemixUIGridCellProps) => {
  const filterCon = useContext(FiltersContext)
  const [anyEnabled, setAnyEnabled] = useState(false)
  const [expand, setExpand] = useState(false)
  const [pinned, setPinned] = useState<boolean>(props.pinned)

  useEffect(() => {
    if (props.tagList) setAnyEnabled(props.tagList.some((key) => filterCon.keyValueMap[key]?.enabled))
    else setAnyEnabled(filterCon?.keyValueMap['no tag']?.enabled)
    if (filterCon.filter != '') setAnyEnabled(anyEnabled && props.title.toLowerCase().includes(filterCon.filter))
    console.log("pin ", pinned)

  }, [filterCon, props.tagList])

  /*const listenOnExpand = (key) => {
    if (key === props.key) setExpand(props.toggleExpandView)
    console.log('expand ----> ', key)
  }

  // The expanded widged should go to the grid-segment and be updated based on the expandedItem state variable of the plugin.
  // The state var will work like theme dispattching is working.

  useEffect(() => {
    // TODO should be refactored to update based on state of plugin.
    props.plugin.on(props.plugin.name, 'expandGridCell', listenOnExpand)
  }, [])
  */

  return (
    <div className='mr-2 mt-3' onClick={() => {
      if (props.expandViewEl)
        props.handleExpand(!expand)
      else return
    }}>
      { anyEnabled && <div className='d-flex flex-column'>
        <div className='d-flex flex-grid'>
          <div className={"d-flex mx-0 p-2 bg-light border border-secondary remixui_grid_cell_container " + props.classList || ''} data-id={"remixUIGS" + props.title}>
            <div className="d-flex remixui_grid_cell flex-column">
              <div className='d-flex flex-row pb-1 align-items-end' style={{ width: '8rem', height: '1rem' }}>
                { props.logo && <img className='remixui_grid_view_logo mr-1' src={props.logo} style={{ width: '1rem', height: '1rem' }}/> }
                { props.title && <label
                  className='m-0 p-0 align-items-left'
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'xx-small' }}
                >
                  { props.title }
                </label> }
              </div>
              { props.children }
            </div>
          </div>
          { filterCon.showPin && <button
            className={`${pinned ? 'fa-duotone' : 'fa-light'}` + ` fa-map-pin text-info border-0 mb-0 remixui_grid_cell_pin`}
            onClick={() => {
              setPinned(!pinned)
              props.pinStateCallback()
            }}
          ></button>}
          { props.tagList && <div className={`d-flex flex-column align-items-begin ` +`${filterCon.showPin ? 'remixui_grid_cell_tags' : 'remixui_grid_cell_tags_no_pin'}`}>
            { Object.keys(props.tagList).map((key) => (
              filterCon.keyValueMap[props.tagList[key]].enabled && (
                <CustomTooltip
                  placement="right"
                  tooltipId="pluginManagerInactiveTitleLinkToDoc"
                  tooltipClasses="text-nowrap"
                  tooltipText={props.tagList[key]}
                >
                  <span key={props.tagList[key]}
                    className={'remixui_grid_cell_tag bg-' + filterCon.keyValueMap[props.tagList[key]].color}
                  >
                  </span>
                </CustomTooltip>
              )
            )) }
          </div> }
          { !props.tagList && <span
            className={'remixui_grid_cell_tags'}>
          </span> }
        </div>
        { expand && <div>
          { props.expandViewEl }
        </div>
        }
      </div> }
    </div>
  )
}

export default RemixUIGridCell
