/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, SyntheticEvent, useEffect, useReducer, useRef, useState } from 'react'
import { IconKindType, Kind, PassedProfile, VerticalIcons } from '../../types/vertical-icons'
import * as packageJson from '../../../../../package.json'
import Home from './components/Home'
import Icon from './components/Icon'
import IconKind from './components/IconKind'
import { resolveClassesReducer } from './reducers/verticalIconsPanelReducers'
import './remix-ui-vertical-icons.css'
import Settings from './components/Settings'
import OtherIcons from './components/OtherIcon'
export interface RemixUiVerticalIconsProps {
  verticalIconsPlugin: VerticalIcons
}

export const profile = {
  name: 'menuicons',
  displayName: 'Vertical Icons',
  description: '',
  version: packageJson.version,
  methods: ['select']
}

interface AddIconProps {
  pProfile: PassedProfile
  verticalIcons: VerticalIcons
}
let VERTICALMENU_HANDLE

export function RemixUiVerticalIcons ({ verticalIconsPlugin }: RemixUiVerticalIconsProps) {
  const [classes, dispatchResolveClasses] = useReducer(resolveClassesReducer, '')
  const [iconKind, setIconKind] = useState<IconKindType>()
  const learnRef = useRef()
  const AddIcon = ({ pProfile, verticalIcons }: AddIconProps) => {
    const { kind, name, icon, displayName, tooltip, documentation } = pProfile
    if (kind === undefined || kind.length === 0) {
      const newIconKind = {
        kind: {
          none: name
        },
        ...iconKind
      }
      setIconKind(newIconKind)
    }

    return (
      <Icon
        displayName={displayName}
        name={name}
        kind={pProfile.kind}
        icon={icon}
        tooltip={tooltip}
        documentation={documentation}
        verticalIconPlugin={verticalIcons}
      />
    )
  }

  // async function itemContextMenu (e: SyntheticEvent, name: string, documentation: string) {
  //   const actions = {}
  //   if (await this.appManager.canDeactivatePlugin(profile, { name })) {
  //     actions['Deactivate'] = () => {
  //       // this.call('manager', 'deactivatePlugin', name)
  //       verticalIconsPlugin.appManager.deactivatePlugin(name)
  //       if (e.target.parentElement.classList.contains('active')) {
  //         verticalIconsPlugin.select('filePanel')
  //       }
  //     }
  //   }
  //   const links = {}
  //   if (documentation) {
  //     links['Documentation'] = documentation
  //   }
  //   if (Object.keys(actions).length || Object.keys(links).length) {
  //     VERTICALMENU_HANDLE && VERTICALMENU_HANDLE.hide(null, true)
  //     VERTICALMENU_HANDLE = contextMenu(e, actions, links)
  //   }
  //   e.preventDefault()
  //   e.stopPropagation()
  // }
  useEffect(() => {
    console.log('length of array', verticalIconsPlugin.targetProfileForChange)
    console.log('learnRef is of this shape ', learnRef.current)
  // @ts-ignore
  }, [verticalIconsPlugin.targetProfileForChange.length])

  return (
    <div className="h-100">
      <div className="remixui_icons">
        <Home
          verticalIconPlugin={verticalIconsPlugin}
        />
        <Fragment>
          <div style={{ borderBottom: '3px solid #333'}} id="topSection">
            <Fragment>
            {verticalIconsPlugin.targetProfileForChange && Object.keys(verticalIconsPlugin.targetProfileForChange).length
              ? Object.keys(verticalIconsPlugin.targetProfileForChange).filter(p => p !== 'settings').map(p => (
                  <Icon
                    kind={verticalIconsPlugin.targetProfileForChange[p].kind}
                    displayName={verticalIconsPlugin.targetProfileForChange[p].displayName}
                    documentation={verticalIconsPlugin.targetProfileForChange[p].documentation}
                    icon={verticalIconsPlugin.targetProfileForChange[p].icon}
                    name={verticalIconsPlugin.targetProfileForChange[p].name}
                    tooltip={verticalIconsPlugin.targetProfileForChange[p].tooltip}
                    verticalIconPlugin={verticalIconsPlugin}
                    key={verticalIconsPlugin.targetProfileForChange[p].displayName}
                  />
                ))
              : null}
              <OtherIcons>
                {
                  Object.keys(verticalIconsPlugin.targetProfileForChange)
                    .filter(p => p === 'none').map(p => (
                      <Icon
                        kind={verticalIconsPlugin.targetProfileForChange[p].kind}
                        displayName={verticalIconsPlugin.targetProfileForChange[p].displayName}
                        documentation={verticalIconsPlugin.targetProfileForChange[p].documentation}
                        icon={verticalIconsPlugin.targetProfileForChange[p].icon}
                        name={verticalIconsPlugin.targetProfileForChange[p].name}
                        tooltip={verticalIconsPlugin.targetProfileForChange[p].tooltip}
                        verticalIconPlugin={verticalIconsPlugin}
                        key={verticalIconsPlugin.targetProfileForChange[p].displayName}
                      />
                    ))
                }
              </OtherIcons>
            </Fragment>
          </div>
          <div id="bottomSection">
            {verticalIconsPlugin.targetProfileForChange && Object.keys(verticalIconsPlugin.targetProfileForChange).length
                ? <Settings>
                  {
                    Object.keys(verticalIconsPlugin.targetProfileForChange).filter(p => p === 'settings').map(p => (
                      <Icon
                        kind={verticalIconsPlugin.targetProfileForChange[p].kind}
                        displayName={verticalIconsPlugin.targetProfileForChange[p].displayName}
                        documentation={verticalIconsPlugin.targetProfileForChange[p].documentation}
                        icon={verticalIconsPlugin.targetProfileForChange[p].icon}
                        name={verticalIconsPlugin.targetProfileForChange[p].name}
                        tooltip={verticalIconsPlugin.targetProfileForChange[p].tooltip}
                        verticalIconPlugin={verticalIconsPlugin}
                        key={verticalIconsPlugin.targetProfileForChange[p].displayName}
                      />
                    ))
                  }
                </Settings>
              : null
            }
          </div>
        </Fragment>
      </div>
    </div>
  )
}
