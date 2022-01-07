import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment, MutableRefObject } from 'react'
import { Chevron } from './Chevron'
import Debugger from './Debugger'
import FilePanel from './FilePanel'
import PluginManager from './PluginManager'
import Solidity from './Solidity'
import SolidityStaticAnalysis from './SolidityStaticAnalysis'
import Udapp from './Udapp'

interface RequiredSectionProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
  scrollableRef: MutableRefObject<any>
}

function RequiredSection ({ verticalIconsPlugin, itemContextAction, addActive, removeActive, scrollableRef }: RequiredSectionProps) {
  return (
    <Fragment>
      <FilePanel
        verticalIconsPlugin={verticalIconsPlugin}
        addActive={addActive}
        removeActive={removeActive}
        itemContextAction={itemContextAction}
      />
      <PluginManager
        verticalIconsPlugin={verticalIconsPlugin}
        addActive={addActive}
        removeActive={removeActive}
        itemContextAction={itemContextAction}
      />
      <Solidity
        verticalIconsPlugin={verticalIconsPlugin}
        addActive={addActive}
        removeActive={removeActive}
        itemContextAction={itemContextAction}
      />
      <Udapp
        verticalIconsPlugin={verticalIconsPlugin}
        addActive={addActive}
        removeActive={removeActive}
        itemContextAction={itemContextAction}
      />
      <SolidityStaticAnalysis
        verticalIconsPlugin={verticalIconsPlugin}
        addActive={addActive}
        removeActive={removeActive}
        itemContextAction={itemContextAction}
      />
      <Debugger
        verticalIconsPlugin={verticalIconsPlugin}
        addActive={addActive}
        removeActive={removeActive}
        itemContextAction={itemContextAction}
      />
      {
        scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
          ? (
            <Chevron
              divElementRef={scrollableRef}
              cssRule={'fa fa-chevron-up remixui_icon-chevron mt-0 mb-0 ml-1 pl-3'}
            />
          ) : null
      }
    </Fragment>
  )
}

export { RequiredSection }
