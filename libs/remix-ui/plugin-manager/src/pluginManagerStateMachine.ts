import { Profile } from '@remixproject/plugin-utils'
import { PluginManagerComponent } from './types'

export const defaultActivatedPlugins = [
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

// /**
//  * Compares default enabled plugins of remix ide
//  * and tracks newly activated plugins and manages
//  * their state by persisting in local storage
//  * @param newPlugin Profile of a Plugin
//  * @param pluginComponent PluginManagerComponent Instance
//  */
// export async function PersistActivatedPlugin (pluginComponent: PluginManagerComponent, newPlugin: Profile) {
//   const persisted = localStorage.getItem('newActivePlugins')
//   const activatedPlugins: Profile[] = JSON.parse(persisted)

//   const newlyActivatedPlugins: Array<Profile> = []
//   const defaultActivated = defaultActivatedPlugins.includes(newPlugin.name) === false
//   if (newPlugin) {
//     if (defaultActivated) {
//       // if this is true then we are sure that the profile name is in localStorage/workspace
//       if (activatedPlugins && activatedPlugins.length && !activatedPlugins.includes(newPlugin)) {
//         await FetchAndPersistPlugin(pluginComponent, newPlugin, activatedPlugins)
//         localStorage.setItem('newActivePlugins', JSON.stringify(activatedPlugins))
//       } else {
//         await FetchAndPersistPlugin(pluginComponent, newPlugin, newlyActivatedPlugins)
//         localStorage.setItem('newActivePlugins', JSON.stringify(newlyActivatedPlugins))
//       }
//     }
//   }
// }

export function populateActivePlugins (pluginComponent: PluginManagerComponent) {
  const activePluginNames = pluginComponent.activeProfiles
  const filteredNames = []
  const workspace: string[] = JSON.parse(localStorage.getItem('workspace'))
  defaultActivatedPlugins.forEach(defaultName => {
    if (workspace.includes(defaultName) === false) {
      filteredNames.push(defaultName)
    }
  })
  // filteredNames = activePluginNames.concat(defaultActivatedPlugins)
  // const newArray = [...new Set(filteredNames)]
  console.log('Here are the plugin names that should be shown!!', filteredNames)
  // console.log('Here are the distinct profile names!!', newArray)
}

// async function FetchAndPersistPlugin (pluginComponent: PluginManagerComponent, newPlugin: Profile<any>, newlyActivatedPlugins: Profile<any>[]) {
//   try {
//     const targetProfile = await pluginComponent.appManager.getProfile(newPlugin.name)
//     if (targetProfile !== null || targetProfile !== undefined) newlyActivatedPlugins.push(targetProfile)
//   } catch {
//     throw new Error('Could not fetch and persist target profile!')
//   }
// }

// /**
//  * Remove a deactivated plugin from persistence (localStorage)
//  * @param pluginName Name of plugin profile to be removed
//  */
// export function RemoveActivatedPlugin (pluginName: string) {
//   const getWorkspacePlugins = JSON.parse(localStorage.getItem('newActivePlugins'))
//   const removeExisting = getWorkspacePlugins.filter(target => target.name !== pluginName)
//   localStorage.setItem('newActivePlugins', JSON.stringify(removeExisting))
// }

// /**
//  * Gets the latest list of inactive plugin profiles and persist them
//  * in local storage
//  * @param inactivesList Array of inactive plugin profiles
//  * @returns {void}
//  */
// export function PersistNewInactivesState (inactivesList: Profile[]) {
//   if (inactivesList && inactivesList.length) {
//     localStorage.setItem('updatedInactives', JSON.stringify(inactivesList))
//   }
// }
