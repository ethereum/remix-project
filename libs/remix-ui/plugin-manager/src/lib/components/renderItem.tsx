import React, { useContext } from 'react'
import { Profile } from '../../customTypes'
import { PluginManagerContext } from '../contexts/pluginmanagercontext'
import PluginCard from './pluginCard'

interface RenderItemProps {
  profile: Profile
}

function RenderItem () {
  const { profile } = useContext(PluginManagerContext)
  // const [displayName, setDisplayName] = useState('')
  // const [docLink, setDocLink] = useState<any>()
  // const [versionWarning, setVersionWarning] = useState<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>>()

  // useEffect(() => {
  //   const checkPluginVersion = (version: string) => {
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     let versionWarning: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
  //     if (version && version.match(/\b(\w*alpha\w*)\b/g)) {
  //       versionWarning = <small title="Version Alpha" className="remixui_versionWarning plugin-version">alpha</small>
  //     }
  //     // Beta
  //     if (version && version.match(/\b(\w*beta\w*)\b/g)) {
  //       versionWarning = <small title="Version Beta" className="remixui_versionWarning plugin-version">beta</small>
  //     }
  //     return versionWarning
  //   }

  //   setDisplayName((profile.displayName) ? profile.displayName : profile.name)
  //   setDocLink(
  //     profile.documentation ? (
  //       <a href={profile.documentation}
  //         className="px-1"
  //         title="link to documentation"
  //         // eslint-disable-next-line react/jsx-no-target-blank
  //         target="_blank">
  //         <i aria-hidden="true" className="fas fa-book"></i>
  //       </a>
  //     ) : '')
  //   setVersionWarning(checkPluginVersion(profile.version))
  // }, [profile.displayName, profile.documentation, profile.name, profile.version, versionWarning])
  console.log('Profile object from render item component', profile)

  return (
    <PluginCard
      // displayName={displayName}
      // docLink={docLink}
      // versionWarning={versionWarning}
      // profileDescription={profile.description}
      // profileIcon={profile.icon}
      // profileName={profile.name}
    />
  )
}

export default RenderItem
