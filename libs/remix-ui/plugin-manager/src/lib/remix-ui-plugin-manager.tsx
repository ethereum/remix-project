import React from 'react'
import { RemixUiPluginManagerProps } from '../types'
import RootView from './components/rootView'
import './remix-ui-plugin-manager.css'

// const test = () => {
//   const appManager = new RemixAppManager()
//   const activePlugins: Profile<any>[] = new Array<Profile<any>>()
//   const inactivePlugins: Profile<any>[] = new Array<Profile<any>>()
//   const isFiltered = (profile) => (profile.displayName ? profile.displayName : profile.name).toLowerCase().includes(this.filter)
//   const isNotRequired = (profile) => !appManager.isRequired(profile.name)
//   const isNotDependent = (profile) => !appManager.isDependent(profile.name)
//   const isNotHome = (profile) => profile.name !== 'home'
//   const sortByName = (profileA, profileB) => {
//     const nameA = ((profileA.displayName) ? profileA.displayName : profileA.name).toUpperCase()
//     const nameB = ((profileB.displayName) ? profileB.displayName : profileB.name).toUpperCase()
//     return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
//   }
//   // const { finalActives, finalInactives } =
//   const tempArray = appManager.getAll()
//     .filter(isFiltered)
//     .filter(isNotRequired)
//     .filter(isNotDependent)
//     .filter(isNotHome)
//     .sort(sortByName)

//   tempArray.forEach(profile => {
//     if (appManager.actives.includes(profile.name)) {
//       activePlugins.push(profile)
//     } else {
//       inactivePlugins.push(profile)
//     }
//   })

//   return { activePlugins, inactivePlugins }
//   // .reduce(({ actives, inactives }, profile) => {
//   //   return isActive(profile.name)
//   //     ? { actives: [...actives, profile], inactives }
//   //     : { inactives: [...inactives, profile], actives }
//   // }, { actives: [], inactives: [] })

//   // // eslint-disable-next-line no-debugger
//   // // debugger
//   // activePlugins = finalActives
//   // inactivePlugins = finalInactives
// }

export const RemixUiPluginManager = (props: RemixUiPluginManagerProps) => {
  return (
    <RootView pluginComponent={props.pluginComponent}/>
  )
}
