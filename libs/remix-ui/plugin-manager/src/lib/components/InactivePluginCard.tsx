import { Profile } from '@remixproject/plugin-utils'
// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-use-before-define
import React, { useContext, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import '../remix-ui-plugin-manager.css'
import { CustomTooltip } from '@remix-ui/helper'
import { onLineContext } from '@remix-ui/app'
const _paq = (window._paq = window._paq || [])

interface PluginCardProps {
  profile: any
  buttonText: string
  activatePlugin: (plugin: string) => void
}

function InactivePluginCard({ profile, buttonText, activatePlugin }: PluginCardProps) {
  const online = useContext(onLineContext)
  const [canBeActivated, setCanBeActivated] = useState(false)
  const intl = useIntl()
  useEffect(() => {
    if (!online) {
      if (profile.url && (!profile.url.includes('http') || profile.url.includes('localhost') || profile.url.includes('127.0.0.1'))) {
        setCanBeActivated(true)
      } else {
        setCanBeActivated(false)
      }
    } else {
      setCanBeActivated(true)
    }
  },[online])

  return (
    <div className="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">
      <article className="list-group-item py-1 mb-1 plugins-list-group-item">
        <div className="remixui_row justify-content-between align-items-center mb-2">
          <h6 className="remixui_displayName plugin-name">
            <div>
              {profile.displayName || profile.name}
              {profile?.maintainedBy?.toLowerCase() == 'remix' ? (
                <CustomTooltip
                  placement="right"
                  tooltipId="pluginManagerActiveTitleByRemix"
                  tooltipClasses="text-nowrap"
                  tooltipText={<FormattedMessage id="pluginManager.maintainedByRemix" />}
                >
                  <i aria-hidden="true" className="px-1 text-success fa-solid fa-shield-halved"></i>
                </CustomTooltip>)
                : profile?.maintainedBy ? (
                  <CustomTooltip
                    placement="right"
                    tooltipId="pluginManagerActiveTitleByRemix"
                    tooltipClasses="text-nowrap"
                    tooltipText={"Maintained by " + profile?.maintainedBy}
                  >
                    <i aria-hidden="true" className="px-1 text-secondary fa-solid fa-shield-halved"></i>
                  </CustomTooltip>)
                  : (<CustomTooltip
                    placement="right"
                    tooltipId="pluginManagerActiveTitleExternally"
                    tooltipClasses="text-nowrap"
                    tooltipText={<FormattedMessage id="pluginManager.maintainedExternally" />}
                  >
                    <i aria-hidden="true" className="px-1 text-secondary fa-solid fa-shield-halved"></i>
                  </CustomTooltip>)
              }
              {profile.documentation && (
                <CustomTooltip
                  placement="right"
                  tooltipId="pluginManagerInactiveTitleLinkToDoc"
                  tooltipClasses="text-nowrap"
                  tooltipText={<FormattedMessage id="pluginManager.linkToDoc" />}
                >
                  <a href={profile.documentation} className="px-1" target="_blank" rel="noreferrer">
                    <i aria-hidden="true" className="fas fa-book" />
                  </a>
                </CustomTooltip>
              )}
              {profile.version && profile.version.match(/\b(\w*alpha\w*)\b/g) ? (
                <CustomTooltip
                  placement="right"
                  tooltipId="pluginManagerActiveVersionAlpha"
                  tooltipClasses="text-nowrap"
                  tooltipText={<FormattedMessage id="pluginManager.versionAlpha" />}
                >
                  <small className="remixui_versionWarning plugin-version">alpha</small>
                </CustomTooltip>
              ) : profile.version && profile.version.match(/\b(\w*beta\w*)\b/g) ? (
                <CustomTooltip
                  placement="right"
                  tooltipId="pluginManagerActiveVersionBeta"
                  tooltipClasses="text-nowrap"
                  tooltipText={<FormattedMessage id="pluginManager.versionBeta" />}
                >
                  <small className="remixui_versionWarning plugin-version">beta</small>
                </CustomTooltip>
              ) : null}
            </div>
            {
              <CustomTooltip
                placement="right"
                tooltipId={`pluginManagerInactiveActiveBtn${profile.name}`}
                tooltipClasses="text-nowrap"
                tooltipText={<FormattedMessage id="pluginManager.activatePlugin" values={{ pluginName: profile.displayName || profile.name }} />}
              >
                {!canBeActivated ? <button className="btn btn-secondary btn-sm">{intl.formatMessage({ id: 'pluginManager.UnavailableOffline' })}</button> : (
                  <button
                    onClick={() => {
                      _paq.push(['trackEvent', 'pluginManager', 'activateBtn', 'activate btn' + profile.name])
                      activatePlugin(profile.name)
                    }}
                    className="btn btn-success btn-sm"
                    data-id={`pluginManagerComponentActivateButton${profile.name}`}
                  >
                    {buttonText}
                  </button>)}
              </CustomTooltip>
            }
          </h6>
        </div>
        <div className="remixui_description d-flex text-body plugin-text mb-2">
          {profile.icon ? <img src={profile.icon} className="mr-1 mt-1 remixui_pluginIcon" alt="profile icon" /> : null}
          <span className="remixui_descriptiontext">{profile.description}</span>
        </div>
      </article>
    </div>
  )
}

export default InactivePluginCard
