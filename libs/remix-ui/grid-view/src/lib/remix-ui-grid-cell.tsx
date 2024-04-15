import React, {useState, useEffect, useContext, useRef, ReactNode} from 'react' // eslint-disable-line

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
  logo?: string
  title?: string       
  tagList?: string[] // max 8, others will be ignored
  classList?: string
  styleList?: any
  children?: ReactNode
}

export const RemixUIGridCell = (props: RemixUIGridCellProps) => {
  const filterCon = useContext(FiltersContext)
  const [anyEnabled, setAnyEnabled] = useState(false)

  useEffect(() => {
    if (props.tagList) setAnyEnabled(props.tagList.some((key) => filterCon.keyValueMap[key]?.enabled))
    else setAnyEnabled(filterCon.showUntagged) 
  }, [filterCon, props.tagList])

  return (
    <div className='mr-2 mt-2'>
      { anyEnabled && <div className='d-flex flex-grid'>
        <div className={"d-flex mx-0 p-2 bg-light border border-secondary remixui_grid_cell_container " + props.classList || ''} data-id={"remixUIGS" + props.title}>
          <div className="d-flex remixui_grid_cell flex-column">
            <div className='d-flex flex-row pb-1 align-items-end' style={{width: '4.4rem', height: '1rem'}}>
              { props.logo && <img className='remixui_grid_view_logo mr-1' src={props.logo}  style={{width: '1rem', height: '1rem'}}/> }
              { props.title && <label className='m-0 p-0 align-items-left'  style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'xx-small'}}>{ props.title }</label> }
            </div>
            { props.children }
          </div>
        </div>
        { props.tagList && <div className='d-flex flex-column align-items-begin' style={{position: 'relative', right: '0.4rem', top: '0.1rem'}}>
          { Object.keys(props.tagList).map((key) => (
            filterCon.keyValueMap[props.tagList[key]].enabled && (
              <CustomTooltip
                placement="right"
                tooltipId="pluginManagerInactiveTitleLinkToDoc"
                tooltipClasses="text-nowrap"
                tooltipText={props.tagList[key]}
              >
                <span key={props.tagList[key]}
                  className={'bg-' + filterCon.keyValueMap[props.tagList[key]].color}
                  style={{ fontSize: 'x-small', fontWeight: 'bolder' , width: '0.4rem', height: '1.2rem'}}>
                </span>
              </CustomTooltip>
            )
          )) }
        </div> }
        { !props.tagList &&  <span
          style={{ fontSize: 'x-small', fontWeight: 'bolder' , width: '0.4rem', height: '1.2rem'}}>
        </span> }
      </div> }
    </div>
  )
}

export default RemixUIGridCell
