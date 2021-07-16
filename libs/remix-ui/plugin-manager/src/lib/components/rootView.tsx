/* eslint-disable no-debugger */
import React, { Fragment, useEffect, useState } from 'react'
import ModuleHeading from './moduleHeading'
import PluginCard from './pluginCard'
import { ModalDialog } from '@remix-ui/modal-dialog'
import { FormStateProps, PluginManagerComponent, PluginManagerProfile, PluginManagerSettings } from '../../types'
import { IframePlugin, WebsocketPlugin } from '@remixproject/engine-web'
import { Profile } from '@remixproject/plugin-utils'
import PermisssionsSettings from './permissions/permissionsSettings'

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
}

function RootView ({ pluginComponent }: RootViewProps) {
  /**
   * Component Local State declaration
   */
  const [visible, setVisible] = useState<boolean>(true)
  const [plugin, setPlugin] = useState(initialState)
  const [filterPlugins, setFilterPlugin] = useState('')
  const [activeP, setActiveP] = useState<Partial<PluginManagerProfile>[]>()
  const [inactiveP, setInactiveP] = useState<Partial<PluginManagerProfile>[]>()

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
   * Plugins list filtering and Sorting based on search input field state change
   */

  const isFiltered = (profile) => (profile.displayName ? profile.displayName : profile.name).toLowerCase().includes(filterPlugins)
  const isNotRequired = (profile) => !pluginComponent.appManager.isRequired(profile.name)
  const isNotDependent = (profile) => !pluginComponent.appManager.isDependent(profile.name)
  const isNotHome = (profile) => profile.name !== 'home'
  const sortByName = (profileA, profileB) => {
    const nameA = ((profileA.displayName) ? profileA.displayName : profileA.name).toUpperCase()
    const nameB = ((profileB.displayName) ? profileB.displayName : profileB.name).toUpperCase()
    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0
  }

  const getAndFilterPlugins = () => {
    const { actives, inactives } = pluginComponent.appManager.getAll()
      .filter(isFiltered)
      .filter(isNotRequired)
      .filter(isNotDependent)
      .filter(isNotHome)
      .sort(sortByName)
      .reduce(({ actives, inactives }, profile) => {
        return pluginComponent.isActive(profile.name)
          ? { actives: [...actives, profile], inactives }
          : { inactives: [...inactives, profile], actives }
      }, { actives: [], inactives: [] })
    setActiveP(actives)
    console.log('profile property on appmanager', pluginComponent.appManager.profile)
    setInactiveP(inactives)
  }
  //  <-- End Filtering and Sorting based on search input field

  useEffect(() => {
    getAndFilterPlugins()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPlugins])

  useEffect(() => {

  }, [activeP, inactiveP])

  return (
    <Fragment>
      <form id="local-plugin-form">
        <ModalDialog
          handleHide={closeModal}
          hide={visible}
          title="Local Plugin"
          okLabel="OK"
          okFn={() => {
            const profile: any = pluginComponent.localPlugin.open(pluginComponent.appManager.getAll())
            if (pluginComponent.appManager.getIds().includes(profile.name)) {
              throw new Error('This name has already been used')
            }
            const lPlugin = profile.type === 'iframe' ? new IframePlugin(profile) : new WebsocketPlugin(profile)
            pluginComponent.engine.register(lPlugin)
            pluginComponent.appManager.activatePlugin(lPlugin.name)
          } }
          cancelLabel="Cancel"
          cancelFn={closeModal}
        >

          <div className="form-group">
            <label htmlFor="plugin-name">Plugin Name <small>(required)</small></label>
            <input className="form-control" onChange={e => pluginChangeHandler('name', e.target.value)} value={plugin.name} id="plugin-name" data-id="localPluginName" placeholder="Should be camelCase" />
          </div>
          <div className="form-group">
            <label htmlFor="plugin-displayname">Display Name</label>
            <input className="form-control" onChange={e => pluginChangeHandler('displayName', e.target.value)} value={plugin.displayName} id="plugin-displayname" data-id="localPluginDisplayName" placeholder="Name in the header" />
          </div>
          <div className="form-group">
            <label htmlFor="plugin-methods">Api (comma separated list of methods name)</label>
            <input className="form-control" onChange={e => pluginChangeHandler('methods', e.target.value)} value={plugin.methods} id="plugin-methods" data-id="localPluginMethods" placeholder="Name in the header" />
          </div>

          <div className="form-group">
            <label htmlFor="plugin-url">Url <small>(required)</small></label>
            <input className="form-control" onChange={e => pluginChangeHandler('url', e.target.value)} value={plugin.url} id="plugin-url" data-id="localPluginUrl" placeholder="ex: https://localhost:8000" />
          </div>
          <h6>Type of connection <small>(required)</small></h6>
          <div className="form-check form-group">
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="type"
                value="iframe"
                id="iframe"
                data-id='localPluginRadioButtoniframe'
                checked={plugin.type === 'iframe'}
                onChange={(e) => pluginChangeHandler('type', e.target.value)} />
              <label className="form-check-label" htmlFor="iframe">Iframe</label>
            </div>
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="type"
                value="ws"
                id="ws"
                data-id='localPluginRadioButtonws'
                checked={plugin.type === 'ws'}
                onChange={(e) => pluginChangeHandler('type', e.target.value)} />
              <label className="form-check-label" htmlFor="ws">Websocket</label>
            </div>
          </div>
          <h6>Location in remix <small>(required)</small></h6>
          <div className="form-check form-group">
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="location"
                value="sidePanel"
                id="sidePanel"
                data-id='localPluginRadioButtonsidePanel'
                checked={plugin.location === 'sidePanel'}
                onChange={(e) => pluginChangeHandler('location', e.target.value)} />
              <label className="form-check-label" htmlFor="sidePanel">Side Panel</label>
            </div>
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="location"
                value="mainPanel"
                id="mainPanel"
                data-id='localPluginRadioButtonmainPanel'
                checked={plugin.location === 'mainPanel'}
                onChange={(e) => pluginChangeHandler('location', e.target.value)} />
              <label className="form-check-label" htmlFor="mainPanel">Main Panel</label>
            </div>
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="location"
                value="none"
                id="none"
                data-id='localPluginRadioButtonnone'
                checked={plugin.location === 'none'}
                onChange={(e) => pluginChangeHandler('location', e.target.value)} />
              <label className="form-check-label" htmlFor="none">None</label>
            </div>
          </div>

        </ModalDialog>
      </form>
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
        <section data-id="pluginManagerComponentPluginManagerSection">
          {activeP !== undefined
            ? (
              <Fragment>
                <ModuleHeading headingLabel="Active Modules" actives={activeP} inactives={inactiveP} />
                {activeP.map((profile) => (
                  <PluginCard
                    key={profile.name}
                    profile={profile}
                    pluginComponent={pluginComponent}
                  />
                ))}
              </Fragment>
            )
            : null
          }
          {inactiveP !== undefined ? (
            <Fragment>
              <ModuleHeading headingLabel="Inactive Modules" inactives={inactiveP} actives={activeP} />
              {inactiveP.map((profile) => (
                <PluginCard
                  key={profile.name}
                  profile={profile}
                  pluginComponent={pluginComponent}
                />
              ))}
            </Fragment>
          ) : null}
        </section>
        <PermisssionsSettings pluginSettings={pluginComponent.pluginSettings}/>
      </div>
    </Fragment>
  )
}

export default RootView
