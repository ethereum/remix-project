import React, { useEffect, useState } from 'react' // eslint-disable-line
import './remix-ui-side-panel.module.css';
import SidePanelElement from './sidepanel-element';

/* eslint-disable-next-line */
export interface RemixUiSidePanelProps {
  plugin: any
  contents: any
}

export function RemixUiSidePanel(props: RemixUiSidePanelProps) {
  const [view, setView] = useState('')
  const [dockLink, setDockLink] = useState(false)
  const [versionWarning, setVersionWarning] = useState<boolean>(false)
  const [versionWarningBeta, setVersionWarningBeta] = useState(false)
  const [profile, setProfile] = useState('')
  const [profileDocsLink, setProfileDocsLink] = useState('')
  const [name, setName] = useState(' - ')

  useEffect(() => {
    console.log('load')
  }, [])

  const getProfile = async () => {
    console.log({ active: props.plugin.active })
    if (props.plugin.active) {
      const profile = await props.plugin.appManager.getProfile(props.plugin.active)
      setProfileDocsLink(profile.documentation)
      profile.displayName ? setName(profile.displayName) : setName(profile.name)
      profile.documentation ? setDockLink(true) : setDockLink(false)
      if (profile.version && profile.version.match(/\b(\w*alpha\w*)\b/g)) {
        setVersionWarning(true)
      } else {
        setVersionWarning(false)
      }
      // Beta
      if (profile.version && profile.version.match(/\b(\w*beta\w*)\b/g)) {
        setVersionWarningBeta(true)
      } else {
        setVersionWarningBeta(false)
      }
    }
  }

  const renderHeader = () => {
    getProfile()
    return (
      <header className='swapitHeader'>
        <h6 className="swapitTitle" data-id="sidePanelSwapitTitle">{name}</h6>
        {dockLink ? (<a href={profileDocsLink} className="titleInfo" title="link to documentation" target="_blank" rel="noreferrer"><i aria-hidden="true" className="fas fa-book"></i></a>) : ''}
        {versionWarning ? (<small title="Version Alpha" className="badge-light versionBadge">alpha</small>) : null}
        {versionWarningBeta ? (<small title="Version Beta" className="badge-light versionBadge">beta</small>) : null}
      </header>
    )
  }

  return (
    <section className='panel plugin-manager'>
      {renderHeader()}
      <div className="pluginsContainer">
        {Object.values(props.contents).map((x) => {
          if (React.isValidElement(x)) {
            return x
          } else {
            return <SidePanelElement render={x} />
          }
        })}
      </div>
    </section>

  );
}

export default RemixUiSidePanel;
