import React, {useEffect, useState} from 'react' // eslint-disable-line
import { FormattedMessage } from 'react-intl'
import { PluginRecord } from '../types'
import './panel.css'
import { CustomTooltip, RenderIf, RenderIfNot } from '@remix-ui/helper'

export interface RemixPanelProps {
  plugins: Record<string, PluginRecord>,
  pinView?: (profile: PluginRecord['profile'], view: PluginRecord['view']) => void,
  unPinView?: (profile: PluginRecord['profile']) => void
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

  const pinPlugin = () => {
    props.pinView && props.pinView(plugin.profile, plugin.view)
  }

  const unPinPlugin = () => {
    props.unPinView && props.unPinView(plugin.profile)
  }

  const tooltipChild = <i className={`px-1 ml-2 pt-1 pb-2 ${!toggleExpander ? 'fas fa-angle-right' : 'fas fa-angle-down bg-light'}`} aria-hidden="true"></i>

  return (
    <header className="d-flex flex-column">
      <div className="swapitHeader px-3 pt-2 pb-0 d-flex flex-row">
        <h6 className="pt-0 mb-1" data-id="sidePanelSwapitTitle">
          {plugin?.profile?.name && <FormattedMessage id={`${plugin.profile.name}.displayName`} defaultMessage={plugin?.profile?.displayName || plugin?.profile?.name} />}
        </h6>
        <div className="d-flex flex-row">
          <div className="d-flex flex-row">
            {plugin?.profile?.maintainedBy?.toLowerCase() === 'remix' ? (
              <CustomTooltip placement="auto-end" tooltipId="maintainedByTooltip" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="panel.maintainedByRemix" />}>
                <i aria-hidden="true" className="text-success mt-1 px-1 fas fa-check"></i>
              </CustomTooltip>)
              : (<CustomTooltip placement="auto-end" tooltipId="maintainedExternally" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="panel.maintainedExternally" />}>
                <i aria-hidden="true" className="mt-1 px-1 text-warning far fa-exclamation-circle"></i>
              </CustomTooltip>)
            }
          </div>
          <div className="swapitHeaderInfoSection d-flex justify-content-between" data-id="swapitHeaderInfoSectionId" onClick={toggleClass}>
            <CustomTooltip placement="auto-end" tooltipText={<FormattedMessage id="panel.pluginInfo" />} tooltipId="pluginInfoTooltip" tooltipClasses="text-nowrap">
              {tooltipChild}
            </CustomTooltip>
          </div>
          {
            plugin && plugin.profile.name !== 'filePanel' && (
              <RenderIfNot condition={plugin.profile.name === 'filePanel'}>
                <>
                  <RenderIf condition={plugin.pinned}>
                    <div className='d-flex' data-id="movePluginToLeft" onClick={unPinPlugin}>
                      <CustomTooltip placement="auto-end" tooltipId="unPinnedMsg" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="panel.unPinnedMsg" />}>
                        <i aria-hidden="true" className="mt-1 px-2 fak fa-fa-dock-l"></i>
                      </CustomTooltip>
                    </div>
                  </RenderIf>
                  <RenderIfNot condition={plugin.pinned}>
                    <div className='d-flex' data-id="movePluginToRight" onClick={pinPlugin}>
                      <CustomTooltip placement="auto-end" tooltipId="pinnedMsg" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="panel.pinnedMsg" />}>
                        <i aria-hidden="true" className="mt-1 px-1 pl-2 fak fa-fa-dock-r"></i>
                      </CustomTooltip>
                    </div>
                  </RenderIfNot>
                </>
              </RenderIfNot>
            )
          }
        </div>
      </div>
      <div className={`bg-light mx-3 mb-2 p-3 pt-1 border-bottom flex-column ${toggleExpander ? 'd-flex' : 'd-none'}`}>
        {plugin?.profile?.author && (
          <span className="d-flex flex-row align-items-center">
            <label className="mb-0 pr-2">
              <FormattedMessage id="panel.author" />:
            </label>
            <span> {plugin?.profile.author} </span>
          </span>
        )}
        {plugin?.profile?.maintainedBy && (
          <span className="d-flex flex-row align-items-center">
            <label className="mb-0 pr-2">
              <FormattedMessage id="panel.maintainedBy" />:
            </label>
            <span> {plugin?.profile.maintainedBy} </span>
          </span>
        )}
        {plugin?.profile?.documentation && (
          <span className="d-flex flex-row align-items-center">
            <label className="mb-0 pr-2">
              <FormattedMessage id="panel.documentation" />:
            </label>
            <span>
              <CustomTooltip placement="right-end" tooltipId="linkToDocsTooltip" tooltipClasses=" text-nowrap " tooltipText={<FormattedMessage id="panel.linkToDoc" />}>
                <a href={plugin?.profile?.documentation} className="titleInfo p-0 mb-2" target="_blank" rel="noreferrer">
                  <i aria-hidden="true" className="fas fa-book"></i>
                </a>
              </CustomTooltip>
            </span>
          </span>
        )}
        {plugin?.profile?.description && (
          <span className="d-flex flex-row align-items-baseline">
            <label className="mb-0 pr-2">
              <FormattedMessage id="panel.description" />:
            </label>
            <span> {plugin?.profile.description} </span>
          </span>
        )}
        {plugin?.profile?.repo && (
          <span className="d-flex flex-row align-items-center">
            <a href={plugin?.profile?.repo} target="_blank" rel="noreferrer">
              <FormattedMessage id="panel.makeAnissue" />
            </a>
          </span>
        )}
      </div>
    </header>
  )
}

export default RemixUIPanelHeader
