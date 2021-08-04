import { getSolidity } from '@remix-ui/plugin-manager'
import { Profile } from '@remixproject/plugin-utils'
import React, { Dispatch, useState } from 'react'
import { PluginManagerComponent } from '../../types'
import '../remix-ui-plugin-manager.css'
interface PluginCardProps {
  profile: Profile & {
    icon?: string
  }
  buttonText: string
  activatePlugin: (plugin: Profile) => void
  inactivePlugins: Profile[]
  setInactivePlugins: Dispatch<React.SetStateAction<Profile<any>[]>>
  setActivePlugins: Dispatch<React.SetStateAction<Profile<any>[]>>
  activePlugins: Profile[]
  pluginComponent: PluginManagerComponent
}

// eslint-disable-next-line no-empty-pattern
function InactivePluginCard ({
  profile,
  buttonText,
  activatePlugin,
  inactivePlugins,
  activePlugins,
  setInactivePlugins,
  setActivePlugins,
  pluginComponent
}: PluginCardProps) {
  const [displayName] = useState<string>((profile.displayName) ? profile.displayName : profile.name)
  const [docLink] = useState<JSX.Element>((profile.documentation) ? (
    <a href={profile.documentation} className="px-1" title="link to documentation" target="_blank" rel="noreferrer">
      <i aria-hidden="true" className="fas fa-book"/>
    </a>
  ) : null)

  const [versionWarning] = useState<JSX.Element>((profile.version && profile.version.match(/\b(\w*alpha\w*)\b/g)) ? (
    <small title="Version Alpha" className="remixui_versionWarning plugin-version">alpha</small>
  ) : (profile.version && profile.version.match(/\b(\w*beta\w*)\b/g)) ? (
    <small title="Version Beta" className="remixui_versionWarning plugin-version">beta</small>
  ) : null)

  return (
    <div className="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">
      <article className="list-group-item py-1 mb-1 plugins-list-group-item" title={displayName}>
        <div className="remixui_row justify-content-between align-items-center mb-2">
          <h6 className="remixui_displayName plugin-name">
            <div>
              {displayName}
              {docLink}
              {versionWarning}
            </div>
            {
              <button
                onClick={async () => {
                  activatePlugin(profile)
                  const actives: Profile[] = JSON.parse(localStorage.getItem('newActivePlugins'))
                  const workspacePlugins = JSON.parse(localStorage.getItem('workspace'))
                  const tempList = []

                  if (actives && actives.length >= 0) {
                    actives.forEach(active => {
                      if (pluginComponent.activeProfiles.includes(active.name) === false) {
                        const tempActives = actives.filter(target => target.name !== active.name)
                        tempList.push(...tempActives)
                      }
                    })
                    if (activePlugins && activePlugins.length > 0) {
                      tempList.push(...activePlugins)
                    }
                    if (workspacePlugins.includes('solidity') === true && workspacePlugins.includes('solidity-logic') === true) {
                      if (pluginComponent.activeProfiles.includes('solidity') && pluginComponent.activeProfiles.includes('solidity-logic')) {
                        const result = await getSolidity(pluginComponent)
                        tempList.push(...result)
                      }
                    }
                  }
                  tempList.push(...actives, profile)
                  localStorage.setItem('newActivePlugins', JSON.stringify(tempList))
                  setActivePlugins([...tempList, profile])
                  const temp = inactivePlugins.filter(plugin => plugin.name !== profile.name).filter(plugin => plugin.name !== 'solidity' && plugin.name !== 'solidity-logic')
                  setInactivePlugins(temp)
                  localStorage.setItem('updatedInactives', JSON.stringify(temp))
                  // const newActives = JSON.parse(localStorage.getItem('newActivePlugins'))
                  // // const updatedInactives = JSON.parse(localStorage.getItem('updatedInactives'))
                  // if (newActives === null || newActives.length === 0) {
                  //       localStorage.setItem('newActivePlugins', JSON.stringify(getSolidity(pluginComponent)))
                  //       const filteredInactives = pluginComponent.inactivePlugins.filter(inactive => inactive.name !== 'solidity' &&
                  //       inactive.name !== 'solidity-logic')
                  //       localStorage.setItem('updatedInactives', JSON.stringify(filteredInactives))
                  //     }
                  //   }
                  // }
                  // check to make sure that this activated profile is removed from inactives
                  // this should happen higher up in use effect at the root checking for the length of trackActiveProfiles
                }}
                className="btn btn-success btn-sm"
                data-id={`pluginManagerComponentActivateButton${profile.name}`}
              >
                {buttonText}
              </button>
            }
          </h6>
        </div>
        <div className="remixui_description d-flex text-body plugin-text mb-2">
          { profile.icon ? <img src={profile.icon} className="mr-1 mt-1 remixui_pluginIcon" alt="profile icon"/> : null }
          <span className="remixui_descriptiontext">{profile.description}</span>
        </div>
      </article>
    </div>
  )
}

export default InactivePluginCard
