/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '@remixproject/plugin-utils'
import React, { Fragment, useEffect, useReducer, useState } from 'react'
import { defaultModuleProfile, IconKindType, PassedProfile, VerticalIcons } from '../../types/vertical-icons'
import * as packageJson from '../../../../../package.json'
import Home from './components/Home'
import Icon from './components/Icon'
import IconKind from './components/IconKind'
import { newProfiles } from '../../../../../apps/remix-ide/src/app/components/vertical-icons'
import { linkContentReducer, resolveClassesReducer } from './reducers/verticalIconsPanelReducers'
import './remix-ui-vertical-icons.css'
export interface RemixUiVerticalIconsProps {
  verticalIconsPlugin: VerticalIcons
  targetProfilesToShow: PassedProfile[]
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

export function RemixUiVerticalIcons ({ verticalIconsPlugin, targetProfilesToShow }: RemixUiVerticalIconsProps) {
  const [classes, dispatchResolveClasses] = useReducer(resolveClassesReducer, '')
  const AddIcon = ({ pProfile, verticalIcons }: AddIconProps) => {
    const { kind, name, icon, displayName, tooltip, documentation } = pProfile
    return (
      <Icon
        displayName={displayName}
        name={name}
        kind={kind}
        icon={icon}
        tooltip={tooltip}
        documentation={documentation}
        verticalIconPlugin={verticalIcons}
      />
    )
  }
  useEffect(() => {
    console.log('length of array', verticalIconsPlugin.targetProfileForChange)
  // @ts-ignore
  }, [verticalIconsPlugin.targetProfileForChange.length])

  return (
    <div className="h-100">
      <div className="remixui_icons">
        <Home
          verticalIconPlugin={verticalIconsPlugin}
        />
        <Fragment>
          {verticalIconsPlugin.targetProfileForChange && verticalIconsPlugin.targetProfileForChange.length
            ? verticalIconsPlugin.targetProfileForChange.map(p => (
              <IconKind key={p.displayName} profile={p} children={<AddIcon pProfile={p} verticalIcons={verticalIconsPlugin} /> }/>
            )) : null}
        </Fragment>
      </div>
    </div>
  )
}
