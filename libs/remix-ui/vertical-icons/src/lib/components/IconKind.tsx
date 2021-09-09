/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment } from 'react'

interface IconKindProps {
  idName: 'fileexplorer' | 'compiler' | 'udapp' | 'testing' | 'analysis' | 'debugging' | 'settings' | 'none'
}

function IconKind ({ idName }: IconKindProps) {
  return (
    <Fragment>
      {
        idName === 'fileexplorer' ? <div id="fileExplorerIcons" data-id="verticalIconsFileExplorerIcons" /> : null
      }
      {
        idName === 'compiler' ? <div id="compileIcons" /> : null
      }
      {
        idName === 'udapp' ? <div id="runIcons" /> : null
      }
      {
        idName === 'testing' ? <div id="testingIcons" /> : null
      }
      {
        idName === 'analysis' ? <div id="analysisIcons" /> : null
      }
      {
        idName === 'debugging' ? <div id="debuggingIcons" data-id="verticalIconsDebuggingIcons" /> : null
      }
      {
        idName === 'none' ? <div id="otherIcons" /> : null
      }
      {
        idName === 'settings' ? <div id="settingsIcons" data-id="vertialIconsSettingsIcons" /> : null
      }
    </Fragment>
  )
}

export default IconKind
