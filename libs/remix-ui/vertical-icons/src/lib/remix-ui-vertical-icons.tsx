/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  Fragment,
  SyntheticEvent,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import {
  IconKindType,
  Kind,
  PassedProfile,
  VerticalIcons
} from '../../types/vertical-icons'
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

function ShowChevron () {
  return (
    <span className="remixui_icon-chevron"></span>
  )
}

export function RemixUiVerticalIcons({
  verticalIconsPlugin
}: RemixUiVerticalIconsProps) {
  const [classes, dispatchResolveClasses] = useReducer(
    resolveClassesReducer,
    ''
  )
  const [iconKind, setIconKind] = useState<IconKindType>()
  const scrollableRef = useRef(null)
  useEffect(() => {
    console.log('length of array', verticalIconsPlugin.targetProfileForChange)
    // @ts-ignore
  }, [verticalIconsPlugin.targetProfileForChange.length])

  useEffect(() => {
    console.log('scrollheight of verticalicons div', scrollableRef.current.scrollHeight)
    console.log('clientHeight of verticalicons div', scrollableRef.current.clientHeight)
  }, [Object.keys(verticalIconsPlugin.targetProfileForChange).length])

  return (
    <div id="iconsP" className="h-100">
      <div className="remixui_icons">
        <div>
        <Home verticalIconPlugin={verticalIconsPlugin} />
        </div>
        <div
          id="remixuiScrollable"
          className="remixui_scrollable-container remixui_scrollbar remixui_hide-scroll"
          ref={scrollableRef}
        >
          {verticalIconsPlugin.targetProfileForChange &&
          Object.keys(verticalIconsPlugin.targetProfileForChange).length
            ? Object.keys(verticalIconsPlugin.targetProfileForChange)
                .filter(p => p !== 'settings')
                .filter(p => p !== 'pluginManager')
                .map(p => (
                  <Icon
                    kind={verticalIconsPlugin.targetProfileForChange[p].kind}
                    displayName={
                      verticalIconsPlugin.targetProfileForChange[p].displayName
                    }
                    documentation={
                      verticalIconsPlugin.targetProfileForChange[p]
                        .documentation
                    }
                    icon={verticalIconsPlugin.targetProfileForChange[p].icon}
                    name={verticalIconsPlugin.targetProfileForChange[p].name}
                    tooltip={
                      verticalIconsPlugin.targetProfileForChange[p].tooltip
                    }
                    verticalIconPlugin={verticalIconsPlugin}
                    key={
                      verticalIconsPlugin.targetProfileForChange[p].displayName
                    }
                  />
                ))
            : null}  
          <OtherIcons>
            {Object.keys(verticalIconsPlugin.targetProfileForChange)
              .filter(p => p === 'none')
              .map(p => (
                <Icon
                  kind={verticalIconsPlugin.targetProfileForChange[p].kind}
                  displayName={
                    verticalIconsPlugin.targetProfileForChange[p].displayName
                  }
                  documentation={
                    verticalIconsPlugin.targetProfileForChange[p].documentation
                  }
                  icon={verticalIconsPlugin.targetProfileForChange[p].icon}
                  name={verticalIconsPlugin.targetProfileForChange[p].name}
                  tooltip={
                    verticalIconsPlugin.targetProfileForChange[p].tooltip
                  }
                  verticalIconPlugin={verticalIconsPlugin}
                  key={
                    verticalIconsPlugin.targetProfileForChange[p].displayName
                  }
                />
              ))}
          </OtherIcons>
          </div>
          {scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight 
            ? <i className="fa fa-chevron-double-down remixui_icon-chevron m-3"></i> 
            : null
          }
          {verticalIconsPlugin.targetProfileForChange &&
          Object.keys(verticalIconsPlugin.targetProfileForChange).length ? (
            <Fragment>
              <Settings>
                <>
                  {Object.keys(verticalIconsPlugin.targetProfileForChange)
                    .filter(p => p === 'pluginManager')
                    .map(p => (
                      <Icon
                        kind={
                          verticalIconsPlugin.targetProfileForChange[p].kind
                        }
                        displayName={
                          verticalIconsPlugin.targetProfileForChange[p]
                            .displayName
                        }
                        documentation={
                          verticalIconsPlugin.targetProfileForChange[p]
                            .documentation
                        }
                        icon={
                          verticalIconsPlugin.targetProfileForChange[p].icon
                        }
                        name={
                          verticalIconsPlugin.targetProfileForChange[p].name
                        }
                        tooltip={
                          verticalIconsPlugin.targetProfileForChange[p].tooltip
                        }
                        verticalIconPlugin={verticalIconsPlugin}
                        key={
                          verticalIconsPlugin.targetProfileForChange[p]
                            .displayName
                        }
                      />
                    ))}
                  {Object.keys(verticalIconsPlugin.targetProfileForChange)
                    .filter(p => p === 'settings')
                    .map(p => (
                      <Icon
                        kind={
                          verticalIconsPlugin.targetProfileForChange[p].kind
                        }
                        displayName={
                          verticalIconsPlugin.targetProfileForChange[p]
                            .displayName
                        }
                        documentation={
                          verticalIconsPlugin.targetProfileForChange[p]
                            .documentation
                        }
                        icon={
                          verticalIconsPlugin.targetProfileForChange[p].icon
                        }
                        name={
                          verticalIconsPlugin.targetProfileForChange[p].name
                        }
                        tooltip={
                          verticalIconsPlugin.targetProfileForChange[p].tooltip
                        }
                        verticalIconPlugin={verticalIconsPlugin}
                        key={
                          verticalIconsPlugin.targetProfileForChange[p]
                            .displayName
                        }
                      />
                    ))}
                </>
              </Settings>
            </Fragment>
          ) : null}
        </div>
      </div>
  )
}
