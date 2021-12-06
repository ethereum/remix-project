import React, { useEffect, useState } from 'react' // eslint-disable-line
import parse from 'html-react-parser'
import './remix-ui-side-panel.module.css';

/* eslint-disable-next-line */
export interface RemixUiSidePanelProps {
  plugin: any
}

export function RemixUiSidePanel(props: RemixUiSidePanelProps) {
  const [view, setView] = useState('')
  const [dockLink, setDockLink] = useState(false)
  const [versionWarning, setVersionWarning] = useState(false)
  const [profile, setProfile] = useState('')
  const [profileDocsLink, setProfileDocsLink] = useState('')
  const [name, setName] = useState(' - ')

  useEffect(() => {
    console.log({ props: props.plugin })
    Object.keys(props.plugin.contents).map((key: string, index: number) => {
      console.log({ key })
      const active = props.plugin.active === key
      if (active) {
        const plugin = props.plugin.contents[key]
        setView(plugin.innerHTML)
      }
    })  
  }, [props.plugin.contents])

  const getProfile  = async () => {
    if (props.plugin.active) {
      const profile =  await props.plugin.appManager.getProfile(props.plugin.active)
      setProfileDocsLink(profile.documentation)
      profile.displayName ? setName(profile.displayName) : setName(profile.name)
      profile.documentation ? setDockLink(true) : setDockLink(false)
      if (profile.version && profile.version.match(/\b(\w*alpha\w*)\b/g)) {
        setVersionWarning(true)
      }
      // Beta
      if (profile.version && profile.version.match(/\b(\w*beta\w*)\b/g)) {
        setVersionWarning(true)
      }
    }
  }

  const renderHeader =  () => {
    getProfile()
   return (
    <header className="swapitHeader" style={{
    display: 'flex',
    alignItems: "center",
    padding: '16px 24px 15px',
    justifyContent: "space-between"
    }}>
    <h6 className="swapitTitle" data-id="sidePanelSwapitTitle">{name}</h6>
    {dockLink ? (<a href={profileDocsLink} className="${css.titleInfo}" title="link to documentation" target="_blank" rel="noreferrer"><i aria-hidden="true" className="fas fa-book"></i></a>) : ''}
    {/* {versionWarning ? (<small title="Version Alpha" className="badge-light versionBadge">alpha</small>) : (<small title="Version Beta" className="badge-light versionBadge">beta</small>)} */}
  </header>
   )
  }


  return (
            <section style={{height: "100%"}}>
              {renderHeader()}
            </section>
  );
}

export default RemixUiSidePanel;
