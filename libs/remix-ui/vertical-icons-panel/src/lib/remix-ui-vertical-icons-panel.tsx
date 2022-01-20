import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { Plugin } from '@remixproject/engine'
import './remix-ui-vertical-icons-panel.css'
import IconList from './components/IconList'
import Home from './components/Home'
import { verticalScrollReducer } from './reducers/verticalScrollReducer'
import { Chevron } from './components/Chevron'
import { IconRecord } from './types'
export interface RemixUiVerticalIconsPanelProps {
  verticalIconsPlugin: Plugin
  icons: IconRecord[]
}

const initialState = {
  scrollHeight: 0,
  clientHeight: 0,
  scrollState: false
}

const RemixUiVerticalIconsPanel = ({
  verticalIconsPlugin, icons
}: RemixUiVerticalIconsPanelProps) => {
  const scrollableRef = useRef<any>()
  const iconPanelRef = useRef<any>()
  const [activateScroll, dispatchScrollAction] = useReducer(verticalScrollReducer, initialState)
  const [theme, setTheme] = useState<string>('dark')



  const evaluateScrollability = () => {
    dispatchScrollAction({
      type: 'resize',
      payload: {
        scrollHeight: scrollableRef.current?.scrollHeight,
        clientHeight: scrollableRef.current?.clientHeight,
        scrollState: false
      }
    })
  }
  
  useEffect(() => {
    window.addEventListener('resize', evaluateScrollability)
    evaluateScrollability()
    return () => {
      window.removeEventListener('resize', evaluateScrollability)
    }
  }, [])

  useEffect(() => {
    evaluateScrollability()
  },[icons, theme])

  useEffect(() => {
    verticalIconsPlugin.call('theme', 'currentTheme').then((th: any) => {
      setTheme(th.quality)
    })
    verticalIconsPlugin.on('theme', 'themeChanged', (th: any) => {
      setTheme(th.quality)
    })
    return () => {
      verticalIconsPlugin.off('theme', 'themeChanged')
    }
  }, [])

  async function itemContextAction (e: any, name: string, documentation: string) {
    verticalIconsPlugin.call('manager', 'deactivatePlugin', name)
  }

  return (
    <div id="iconsP" className="h-100">
      <div className="remixui_icons d-flex flex-column vh-100" ref={iconPanelRef}>
        <Home verticalIconPlugin={verticalIconsPlugin} />
        <div className={scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
          ? 'remixui_default-icons-container remixui_requiredSection' : activateScroll && activateScroll.scrollState ? 'remixui_default-icons-container remixui_requiredSection' : 'remixui_requiredSection'}>
          <IconList
            theme={theme}
            icons={icons.filter((p) => p.isRequired && p.profile.name !== 'pluginManager')}
            verticalIconsPlugin={verticalIconsPlugin}
            itemContextAction={itemContextAction}
          />
          {
            scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
              ? (
                <Chevron
                  direction='up'
                  divElementRef={scrollableRef}
                  cssRule={'fa fa-chevron-up remixui_icon-chevron my-0'}
                />
              ) : null
          }
        </div>
        <div
          id="remixuiScrollable"
          className={scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight
            ? 'remixui_default-icons-container remixui_scrollable-container remixui_scrollbar remixui_hide-scroll'
            : activateScroll && activateScroll.scrollState ? 'remixui_default-icons-container remixui_scrollable-container remixui_scrollbar remixui_hide-scroll' : 'remixui_scrollable-container remixui_scrollbar remixui_hide-scroll'}
          ref={scrollableRef}
        >
          <IconList
            theme={theme}
            icons={icons.filter((p) => {return !p.isRequired && p.profile.name !== 'settings'})}
            verticalIconsPlugin={verticalIconsPlugin}
            itemContextAction={itemContextAction}
          />
        </div>
        <div className="remixui_default-icons-container border-0">
          { scrollableRef.current && scrollableRef.current.scrollHeight > scrollableRef.current.clientHeight ? (<Chevron
            divElementRef={scrollableRef}
            direction='down'
            cssRule={'fa fa-chevron-down remixui_icon-chevron my-0'}
          />) : null }
          <IconList
            theme={theme}
            icons={icons.filter((p) => p.profile.name === 'settings' || p.profile.name === 'pluginManager')}
            verticalIconsPlugin={verticalIconsPlugin}
            itemContextAction={itemContextAction}
          />
        </div>
      </div>
    </div>
  )
}

export default RemixUiVerticalIconsPanel
