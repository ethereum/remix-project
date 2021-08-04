/* eslint-disable no-debugger */
import React, { Fragment, ReactNode, useEffect, useState } from 'react'
import { FormStateProps, PluginManagerComponent } from '../../types'
import PermisssionsSettings from './permissions/permissionsSettings'
import { Profile } from '@remixproject/plugin-utils'
import LocalPluginForm from './LocalPluginForm'

const initialState: FormStateProps = {
  name: 'test',
  displayName: 'test',
  url: '',
  type: 'iframe',
  hash: '',
  methods: 'test',
  location: 'sidePanel'
}

interface RootViewProps {
  pluginComponent: PluginManagerComponent
  children: ReactNode
}

export interface pluginDeactivated {
  flag: boolean
  profile: Profile
}

export interface pluginActivated {
  flag: boolean
  profile: Profile
}

function RootView ({ pluginComponent, children }: RootViewProps) {
  /**
   * Component Local State declaration
   */
  const [visible, setVisible] = useState<boolean>(true)
  const [plugin, setPlugin] = useState(initialState)
  const [filterPlugins, setFilterPlugin] = useState('')

  // const { activeProfiles, inactiveProfiles } = useContext(PluginManagerContext)

  function pluginChangeHandler<P extends keyof FormStateProps> (formProps: P, value: FormStateProps[P]) {
    setPlugin({ ...plugin, [formProps]: value })
  }

  /**
   * Modal Visibility States
   */
  const openModal = () => {
    setVisible(false)
  }
  const closeModal = () => setVisible(true)
  // <-- End Modal Visibility States -->

  /**
 * Gets the latest list of inactive plugin profiles and persist them
 * in local storage
 * @param inactivesList Array of inactive plugin profiles
 * @returns {void}
 */
  // function PersistNewInactivesState (inactivesList: Profile[]) {
  //   if (inactivesList && inactivesList.length) {
  //     localStorage.setItem('updatedInactives', JSON.stringify(inactivesList))
  //   }
  // }

  useEffect(() => {
    pluginComponent.getAndFilterPlugins(filterPlugins)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPlugins])

  return (
    <Fragment>
      <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
        <header className="form-group remixui_pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
          <input
            type="text"
            onChange={(event) => {
              setFilterPlugin(event.target.value.toLowerCase())
            }}
            className="form-control"
            placeholder="Search"
            data-id="pluginManagerComponentSearchInput"
          />
          <button onClick={openModal} className="remixui_pluginSearchButton btn bg-transparent text-dark border-0 mt-2 text-underline" data-id="pluginManagerComponentPluginSearchButton">
            Connect to a Local Plugin
          </button>
        </header>
        {children}
        <PermisssionsSettings pluginSettings={pluginComponent.pluginSettings}/>
      </div>
      <LocalPluginForm
        closeModal={closeModal}
        changeHandler={pluginChangeHandler}
        visible={visible}
        plugin={plugin}
        pluginManager={pluginComponent}
      />
    </Fragment>
  )
}

export default RootView
