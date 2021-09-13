/* eslint-disable @typescript-eslint/no-unused-vars */
import { PassedProfile } from 'libs/remix-ui/vertical-icons/types/vertical-icons'
import React, { Fragment, ReactNode } from 'react'

// idName: 'fileexplorer' | 'compiler' | 'udapp' | 'testing' | 'analysis' | 'debugging' | 'settings' | 'none'
interface IconKindProps {
  children: ReactNode
  profile: PassedProfile
}

function IconKind ({ profile, children }: IconKindProps) {
  return (
    <Fragment>
      {
        profile.kind === 'fileexplorer' ? <div id="fileExplorerIcons" data-id="verticalIconsFileExplorerIcons">{ children }</div> : null
      }
      {
        profile.kind === 'compiler' ? <div id="compileIcons">{ children }</div> : null
      }
      {
        profile.kind === 'udapp' ? <div id="runIcons">{ children }</div> : null
      }
      {
        profile.kind === 'testing' ? <div id="testingIcons">{ children }</div> : null
      }
      {
        profile.kind === 'analysis' ? <div id="analysisIcons">{ children }</div> : null
      }
      {
        profile.kind === 'debugging' ? <div id="debuggingIcons" data-id="verticalIconsDebuggingIcons">{ children }</div> : null
      }
      {
        profile.kind === 'undefined' || profile.kind === 'none' ? <div id="otherIcons">{ children }</div> : null
      }
      {
        profile.kind === 'settings' ? <div id="settingsIcons" data-id="vertialIconsSettingsIcons">{ children }</div> : null
      }
    </Fragment>
  )
}

export default IconKind
