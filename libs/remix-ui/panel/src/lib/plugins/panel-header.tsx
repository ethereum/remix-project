import React, { useEffect, useRef, useState } from 'react' // eslint-disable-line
import { FormattedMessage } from 'react-intl'
import { PluginRecord } from '../types'
import './panel.css'
import { CustomTooltip } from '@remix-ui/helper'

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

  const tooltipChild = (
    <i className={`px-1 ml-2 pt-1 pb-2 ${!toggleExpander ? 'fas fa-angle-right' : 'fas fa-angle-down bg-light'}`} aria-hidden="true"></i>
  )

  return (
    <header className='d-flex flex-column'>
      <div className="swapitHeader px-3 pt-2 pb-0 d-flex flex-row">
        <h6 className="pt-0 mb-1" data-id='sidePanelSwapitTitle'>
          { plugin?.profile?.name && <FormattedMessage id={`${plugin.profile.name}.displayName`} defaultMessage={plugin?.profile?.displayName || plugin?.profile?.name} /> }
        </h6>
        <div className="d-flex flex-row">
          <div className="d-flex flex-row">
            {plugin?.profile?.maintainedBy?.toLowerCase() === "remix" && (
              <CustomTooltip
                placement="right-end"
                tooltipId="maintainedByTooltip"
                tooltipClasses="text-nowrap"
                tooltipText="Maintained by Remix"
                >
                <i aria-hidden="true" className="text-success mt-1 px-1 fas fa-check"></i>
              </CustomTooltip>
            )}
          </div>
          <div className="swapitHeaderInfoSection d-flex justify-content-between" data-id='swapitHeaderInfoSectionId' onClick={toggleClass}>
            <CustomTooltip
              placement="right-end"
              tooltipText="Plugin info"
              tooltipId="pluginInfoTooltip"
              tooltipClasses="text-nowrap"
            >
              {tooltipChild}
            </CustomTooltip>
          </div>
        </div>
      </div>
      <div className={`bg-light mx-3 mb-2 p-3 pt-1 border-bottom flex-column ${toggleExpander ? "d-flex" : "d-none"}`}>
        {plugin?.profile?.author && <span className="d-flex flex-row align-items-center">
          <label className="mb-0 pr-2"><FormattedMessage id='panel.author' />:</label>
          <span> { plugin?.profile.author } </span>
        </span>}
        {plugin?.profile?.maintainedBy && <span className="d-flex flex-row align-items-center">
          <label className="mb-0 pr-2"><FormattedMessage id='panel.maintainedBy' />:</label>
          <span> { plugin?.profile.maintainedBy } </span>
        </span>}
        {plugin?.profile?.documentation && <span className="d-flex flex-row align-items-center">
          <label className="mb-0 pr-2"><FormattedMessage id='panel.documentation' />:</label>
          <span>
            <CustomTooltip
              placement="right-end"
              tooltipId="linkToDocsTooltip"
              tooltipClasses=" text-nowrap "
              tooltipText="Link to documentation"
            >
              <a href={plugin?.profile?.documentation} className="titleInfo p-0 mb-2" target="_blank" rel="noreferrer"><i aria-hidden="true" className="fas fa-book"></i></a>
            </CustomTooltip>
          </span>
        </span>}
        {plugin?.profile?.description && <span className="d-flex flex-row align-items-baseline">
          <label className="mb-0 pr-2"><FormattedMessage id='panel.description' />:</label>
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
