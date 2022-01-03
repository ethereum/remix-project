import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment } from 'react'
// import Badge from './Badge'
import Icon from './Icon'

interface SolidityProps {
  verticalIconsPlugin: VerticalIcons
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  addActive: (name: string) => void
  removeActive: () => void
}

// const init = [initialState]

function Solidity ({ verticalIconsPlugin, itemContextAction, addActive, removeActive }: SolidityProps) {
  // const [badgeStatus, dispatchStatusUpdate] = useReducer(iconBadgeReducer, init)

  // useEffect(() => {
  //   verticalIconsPlugin.on('solidity', 'statusChanged', (iconStatus: IconStatus) => {
  //     iconStatus.pluginName = 'solidity'
  //     const action: IconBadgeReducerAction = { type: 'solidity', payload: { status: iconStatus, verticalIconPlugin: verticalIconsPlugin } }
  //     dispatchStatusUpdate(action)
  //   })
  // }, [])
  return (
    <Fragment>
      {verticalIconsPlugin.targetProfileForChange &&
      Object.keys(verticalIconsPlugin.targetProfileForChange).length
        ? Object.keys(verticalIconsPlugin.targetProfileForChange)
          .filter(p => p === 'solidity')
          .map(p => (
            <div id="compileIcons" key={
              verticalIconsPlugin.targetProfileForChange[p].displayName
            }>
              <Icon
                profile={verticalIconsPlugin.targetProfileForChange[p]}
                verticalIconPlugin={verticalIconsPlugin}
                contextMenuAction={itemContextAction}
                addActive={addActive}
                removeActive={removeActive}
                key={
                  verticalIconsPlugin.targetProfileForChange[p].displayName
                }
              />
            </div>
          ))
        : null}
    </Fragment>
  )
}

export default Solidity
