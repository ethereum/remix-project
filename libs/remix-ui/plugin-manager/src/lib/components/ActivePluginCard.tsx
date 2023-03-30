// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-use-before-define
import React from 'react'
import '../remix-ui-plugin-manager.css'
import { CustomTooltip } from '@remix-ui/helper'
interface PluginCardProps {
  profile: any
  buttonText: string
  deactivatePlugin: (pluginName: string) => void
}

function ActivePluginCard ({
  profile,
  buttonText,
  deactivatePlugin
}: PluginCardProps) {
  return (
    <div className="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">
      <article className="list-group-item py-1 mb-1 plugins-list-group-item">
        <div className="remixui_row justify-content-between align-items-center mb-2">
          <h6 className="remixui_displayName plugin-name">
            <div>
              { profile.displayName || profile.name }
              { profile?.maintainedBy?.toLowerCase() == "remix" &&
                <CustomTooltip
                  placement="right"
                  tooltipId="pluginManagerActiveTitleByRemix"
                  tooltipClasses="text-nowrap"
                  tooltipText="Maintained by Remix"
                >
                  <i aria-hidden="true" className="px-1 text-success fas fa-check"></i>
                </CustomTooltip>
              }
              { profile.documentation &&
                <CustomTooltip
                  placement="right"
                  tooltipId="pluginManagerActiveLinkToDoc"
                  tooltipClasses="text-nowrap"
                  tooltipText="Link to documentation"
                >
                  <a href={profile.documentation} className="px-1" target="_blank" rel="noreferrer">
                    <i aria-hidden="true" className="fas fa-book"/>
                  </a>
                </CustomTooltip>
              }
              { profile.version && profile.version.match(/\b(\w*alpha\w*)\b/g)
                ? <CustomTooltip
                  placement="right"
                  tooltipId="pluginManagerActiveVersionAlpha"
                  tooltipClasses="text-nowrap"
                  tooltipText="Version Alpha"
                >
                  <small className="remixui_versionWarning plugin-version">alpha</small>
                </CustomTooltip>
                : profile.version && profile.version.match(/\b(\w*beta\w*)\b/g)
                  ? <CustomTooltip
                    placement="right"
                    tooltipId="pluginManagerActiveVersionBeta"
                    tooltipClasses="text-nowrap"
                    tooltipText="Version Beta"
                  >
                    <small className="remixui_versionWarning plugin-version">beta</small>
                  </CustomTooltip>
                  : null
              }
            </div>
            {
              <CustomTooltip
                placement="right"
                tooltipId={`pluginManagerInactiveActiveBtn${profile.name}`}
                tooltipClasses="text-nowrap"
                tooltipText={`Deactivate ${profile.displayName || profile.name}`}
              >
                <button
                  onClick={() => {
                    deactivatePlugin(profile.name)
                  } }
                  className="btn btn-secondary btn-sm"
                  data-id={`pluginManagerComponentDeactivateButton${profile.name}`}
                >
                  {buttonText}
                </button>
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

export default ActivePluginCard
