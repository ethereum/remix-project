import { Profile } from '@remixproject/plugin-utils'
import { PluginManagerComponent } from './types'

const defaultActivatedPlugins = [
  'manager',
  'contentImport',
  'theme',
  'editor',
  'fileManager',
  'compilerMetadata',
  'compilerArtefacts',
  'network',
  'web3Provider',
  'offsetToLineColumnConverter',
  'mainPanel',
  'menuicons',
  'tabs',
  'sidePanel',
  'home',
  'hiddenPanel',
  'contextualListener',
  'terminal',
  'fetchAndCompile',
  'pluginManager',
  'filePanel',
  'settings',
  'udapp'
]

/**
 * Compares default enabled plugins of remix ide
 * and tracks newly activated plugins and manages
 * their state by persisting in local storage
 * @param newPlugin Profile of a Plugin
 * @param pluginComponent PluginManagerComponent Instance
 */
export async function PersistActivatedPlugin (pluginComponent: PluginManagerComponent, newPlugin: Profile) {
  const persisted = localStorage.getItem('newActivePlugins')
  const activatedPlugins: Profile[] = JSON.parse(persisted)

  const newlyActivatedPlugins: Array<Profile> = []
  const defaultActivated = defaultActivatedPlugins.includes(newPlugin.name) === false
  if (newPlugin) {
    if (defaultActivated) {
      // if this is true then we are sure that the profile name is in localStorage/workspace
      if (activatedPlugins && activatedPlugins.length && !activatedPlugins.includes(newPlugin)) {
        await FetchAndPersistPlugin(pluginComponent, newPlugin, activatedPlugins)
        localStorage.setItem('newActivePlugins', JSON.stringify(activatedPlugins))
      } else {
        await FetchAndPersistPlugin(pluginComponent, newPlugin, newlyActivatedPlugins)
        localStorage.setItem('newActivePlugins', JSON.stringify(newlyActivatedPlugins))
      }
    }
  }
}

/**
 * Update the list of inactive plugin profiles filtering based on a predetermined
 * filter pipeline
 * @param deactivatedPlugin plugin profile to be deactivated
 * @param pluginComponent Plugin manager class which is the context for all operations
 * @returns {Array} array of inactives
 */
export async function UpdateInactivePluginList (deactivatedPlugin: Profile, pluginComponent: PluginManagerComponent) {
  const activated: Profile[] = JSON.parse(window.localStorage.getItem('newActivePlugins'))
  const isFiltered = (profile) => (profile.displayName ? profile.displayName : profile.name)
    .toLowerCase().includes(deactivatedPlugin.name)
  const isNotActivated = (profile) => activated.includes(profile)
  const isNotRequired = (profile) => !pluginComponent.appManager.isRequired(profile.name)
  const isNotDependent = (profile) => !pluginComponent.appManager.isDependent(profile.name)
  const isNotHome = (profile) => profile.name !== 'home'
  const sortByName = (profileA, profileB) => {
    const nameA = ((profileA.displayName) ? profileA.displayName : profileA.name).toUpperCase()
    const nameB = ((profileB.displayName) ? profileB.displayName : profileB.name).toUpperCase()
    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
  }
  const tempArray = pluginComponent.appManager.getAll()
    .filter(isFiltered)
    .filter(isNotActivated)
    .filter(isNotRequired)
    .filter(isNotDependent)
    .filter(isNotHome)
    .sort(sortByName)
  return tempArray
}

// export function GetNewlyActivatedPlugins (pluginComponent: PluginManagerComponent) {
//   const profiles: Profile[] = JSON.parse(window.localStorage.getItem('newActivePlugins'))
//   let isValid: boolean = false
//   // eslint-disable-next-line no-debugger
//   debugger
//   pluginComponent.activeProfiles.forEach(profileName => {
//     isValid = profiles.some(profile => profile.name === profileName)
//   })
//   if (isValid) {
//     return profiles
//   } else {
//     profiles.forEach(profile => {
//       if (!pluginComponent.activeProfiles.includes(profile.name)) {
//         RemoveActivatedPlugin(profile.name)
//       }
//     })
//     const newProfiles = JSON.parse(window.localStorage.getItem('newActivePlugins'))
//     return newProfiles
//   }
// }

async function FetchAndPersistPlugin (pluginComponent: PluginManagerComponent, newPlugin: Profile<any>, newlyActivatedPlugins: Profile<any>[]) {
  try {
    const targetProfile = await pluginComponent.appManager.getProfile(newPlugin.name)
    if (targetProfile !== null || targetProfile !== undefined) newlyActivatedPlugins.push(targetProfile)
  } catch {
    throw new Error('Could not fetch and persist target profile!')
  }
}

/**
 * Remove a deactivated plugin from persistence (localStorage)
 * @param pluginName Name of plugin profile to be removed
 */
export function RemoveActivatedPlugin (pluginName: string) {
  const getWorkspacePlugins = JSON.parse(localStorage.getItem('newActivePlugins'))
  const removeExisting = getWorkspacePlugins.filter(target => target.name !== pluginName)
  localStorage.setItem('newActivePlugins', JSON.stringify(removeExisting))
}

/**
 * Gets the latest list of inactive plugin profiles and persist them
 * in local storage
 * @param inactivesList Array of inactive plugin profiles
 * @returns {void}
 */
export function PersistNewInactivesState (inactivesList: Profile[]) {
  if (inactivesList && inactivesList.length) {
    localStorage.setItem('updatedInactives', JSON.stringify(inactivesList))
  }
}
