/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useRef, useState } from 'react' // eslint-disable-line
import { PluginRecord } from '../types'
import './panel.css'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

export interface RemixPanelProps {
  plugins: Record<string, PluginRecord>;
}
const RemixUIPanelHeader = (props: RemixPanelProps) => {
  const [plugin, setPlugin] = useState<PluginRecord>()
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)

  useEffect(() => {
    setToggleExpander(false)
    if (props.plugins) {
      const p = Object.values(props.plugins).find((pluginRecord) => {
        return pluginRecord.active === true
      })
      setPlugin(p)
    }
  }, [props])

  const toggleClass = () => {
    setToggleExpander(!toggleExpander)
  }

  return (
    <header className='d-flex flex-column'>
      <div className="swapitHeader px-3 pt-2 pb-0 d-flex flex-row">
        <h6 className="mb-3" data-id='sidePanelSwapitTitle'>{plugin?.profile.displayName || plugin?.profile.name}</h6>
        <div className="d-flex flex-row">
          <div className="d-flex flex-row">
            {plugin?.profile?.maintainedBy?.toLowerCase() === "remix" && (
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="maintainedByTooltip" className="text-nowrap">
                    <span>{"Maintained by Remix"}</span>
                  </Tooltip>
                }
              >
                <i aria-hidden="true" className="text-success mt-1 px-1 fas fa-check"></i>
              </OverlayTrigger>
            )}
          </div>
          <OverlayTrigger overlay={
            <Tooltip className="text-nowrap" id="pluginInfoTooltip">
              <span>Plugin info</span>
            </Tooltip>
          } placement={'right-end'}>
            <div className="swapitHeaderInfoSection d-flex justify-content-between" data-id='swapitHeaderInfoSectionId' onClick={toggleClass}>
              <i className={`px-2 ml-2 pt-1 pb-4 ${!toggleExpander ? 'fas fa-angle-right' : 'fas fa-angle-down bg-light'}`} aria-hidden="true"></i>
            </div>
          </OverlayTrigger>
        </div>
      </div>
      <div className={`bg-light mx-3 mb-2 p-3 pt-1 border-bottom flex-column ${toggleExpander ? "d-flex" : "d-none"}`}>
        {plugin?.profile?.author && <span className="d-flex flex-row align-items-center">
          <label className="mb-0 pr-2">Author:</label>
          <span> { plugin?.profile.author } </span>
        </span>}
        {plugin?.profile?.maintainedBy && <span className="d-flex flex-row align-items-center">
          <label className="mb-0 pr-2">Maintained by:</label>
          <span> { plugin?.profile.maintainedBy } </span>
        </span>}
        {plugin?.profile?.documentation && <span className="d-flex flex-row align-items-center">
          <label className="mb-0 pr-2">Documentation:</label>
          <span>
            <a href={plugin?.profile?.documentation} className="titleInfo p-0 mb-2" title="link to documentation" target="_blank" rel="noreferrer"><i aria-hidden="true" className="fas fa-book"></i></a>
          </span>
        </span>}
        {plugin?.profile?.description && <span className="d-flex flex-row align-items-baseline">
          <label className="mb-0 pr-2">Description:</label>
          <span> { plugin?.profile.description } </span>
        </span>}
        {plugin?.profile?.repo && <span className="d-flex flex-row align-items-center">
          <a href={plugin?.profile?.repo} target="_blank" rel="noreferrer">
          Make an issue</a>
        </span>}
      </div>
    </header>)
}

export default RemixUIPanelHeader
