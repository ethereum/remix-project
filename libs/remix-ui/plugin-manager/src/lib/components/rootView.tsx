/* eslint-disable no-debugger */
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import ModuleHeading from './moduleHeading'
import { ModalDialog } from '@remix-ui/modal-dialog'
import { FormStateProps, PluginManagerComponent } from '../../types'
import { IframePlugin, WebsocketPlugin } from '@remixproject/engine-web'
import PermisssionsSettings from './permissions/permissionsSettings'
import { Profile } from '@remixproject/plugin-utils'
import ActivePluginCard from './ActivePluginCard'
import InactivePluginCard from './InactivePluginCard'
import { PersistNewInactivesState, RemoveActivatedPlugin } from '../../pluginManagerStateMachine'

const initialState: FormStateProps = {
  pname: 'test',
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
  const [activeP, setActiveP] = useState<Profile[]>([])
  const [inactiveP, setInactiveP] = useState<Profile[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setTriggerRefresh] = useState(false)
  const [validInactiveProfiles] = useState<Profile[]>(JSON.parse(window.localStorage.getItem('updatedInactives')))
  const [validActiveProfiles] = useState<Profile[]>(JSON.parse(window.localStorage.getItem('newActivePlugins')))
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncInactiveProfiles = () => {
    PersistNewInactivesState(inactiveP)
    setTriggerRefresh(true)
  }

  const GetNewlyActivatedPlugins = useCallback((pluginComponent: PluginManagerComponent) => {
    // const profiles: Profile[] = JSON.parse(window.localStorage.getItem('newActivePlugins'))
    let isValid: boolean = false
    pluginComponent.activeProfiles.forEach(profileName => {
      isValid = validActiveProfiles.some(profile => profile.name === profileName)
    })
    if (isValid) {
      return validActiveProfiles
    } else {
      const profiles = validActiveProfiles // make a copy of state and don't mutate state directly
      profiles.forEach(profile => {
        if (!pluginComponent.activeProfiles.includes(profile.name)) {
          RemoveActivatedPlugin(profile.name)
        }
      })
      const newProfiles = JSON.parse(window.localStorage.getItem('newActivePlugins'))
      return newProfiles
    }
  }, [validActiveProfiles])

  useEffect(() => {
    if (activeP.length === 0) {
      const activeProfiles = GetNewlyActivatedPlugins(pluginComponent)
      if (activeProfiles !== null && activeProfiles.length) {
        setActiveP(activeProfiles)
      } else {
        setActiveP(pluginComponent.activePlugins)
      }
    }
  }, [GetNewlyActivatedPlugins, activeP, pluginComponent, pluginComponent.activePlugins, syncInactiveProfiles])

  useEffect(() => {
    if (pluginComponent.activePlugins && pluginComponent.activePlugins.length) {
      setActiveP(pluginComponent.activePlugins)
    }

    if (pluginComponent.inactivePlugins && pluginComponent.inactivePlugins.length) {
      setInactiveP(pluginComponent.inactivePlugins)
    }
    let inactivesCopy = []
    if (validInactiveProfiles && validInactiveProfiles.length) {
      if (validActiveProfiles && validActiveProfiles.length) {
        validActiveProfiles.forEach(active => {
          inactivesCopy = validInactiveProfiles.filter(inactive => inactive.name !== active.name)
            .filter(inactive => inactive.displayName !== active.displayName)
        })
      }
      console.log('inactivescopy length', validInactiveProfiles.length)
      if (inactivesCopy.length) setInactiveP(validInactiveProfiles)
    }
  }, [pluginComponent.activePlugins, pluginComponent.inactivePlugins, pluginComponent.activeProfiles, pluginComponent, validInactiveProfiles, inactiveP.length, validActiveProfiles])

  useEffect(() => {
    pluginComponent.getAndFilterPlugins(filterPlugins)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPlugins])

  // useEffect(() => {
  //   if (validInactiveProfiles && validInactiveProfiles.length &&
  //     inactiveP.length > validInactiveProfiles.length) {
  //     setInactiveP(validInactiveProfiles)
  //   }

  //   let inactivesCopy = []
  //   if (validInactiveProfiles && validInactiveProfiles.length) {
  //     if (inactiveP.length > validInactiveProfiles.length) {
  //       if (validActiveProfiles && validActiveProfiles.length) {
  //         validActiveProfiles.forEach(active => {
  //           inactivesCopy = validInactiveProfiles.filter(inactive => inactive !== active)
  //             .filter(inactive => inactive.displayName !== active.displayName)
  //         })
  //       }
  //       console.log('inactivescopy length', validInactiveProfiles.length)
  //       if (inactivesCopy.length) setInactiveP(validInactiveProfiles)
  //     }
  //   }
  // }, [inactiveP, triggerRefresh, validActiveProfiles, validInactiveProfiles])

  // useEffect(() => {
  //   syncInactiveProfiles()
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [inactiveP, triggerRefresh])

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
        <section data-id="pluginManagerComponentPluginManagerSection">
          {(activeP && activeP.length > 0) && <Fragment>
            <ModuleHeading headingLabel="Active Modules" count={activeP.length} />
            {activeP.map((profile) => (
              <ActivePluginCard
                buttonText="Deactivate"
                key={profile.name}
                profile={profile}
                syncInactiveProfiles={syncInactiveProfiles}
                pluginComponent={pluginComponent}
              />
            ))}
          </Fragment>
          }
          {inactiveP && <Fragment>
            <ModuleHeading headingLabel="Inactive Modules" count={inactiveP.length} />
            {inactiveP.map((profile) => (
              <InactivePluginCard
                buttonText="Activate"
                key={profile.name}
                profile={profile}
                pluginComponent={pluginComponent}
              />
            ))}
          </Fragment>
          }
        </section>
        <PermisssionsSettings pluginSettings={pluginComponent.pluginSettings}/>
      </div>
      <form id="local-plugin-form">
        <ModalDialog
          handleHide={closeModal}
          hide={visible}
          title="Local Plugin"
          okLabel="OK"
          okFn={() => {
            const profile = JSON.parse(localStorage.getItem('plugins/local')) || plugin
            if (!profile) return
            if (pluginComponent.appManager.getIds().includes(profile.pname)) {
              throw new Error('This name has already been used')
            }
            if (!profile.location) throw new Error('Plugin should have a location')
            if (!profile.pname) throw new Error('Plugin should have a name')
            if (!profile.url) throw new Error('Plugin should have an URL')
            const localPlugin = profile.type === 'iframe' ? new IframePlugin(profile) : new WebsocketPlugin(profile)
            localPlugin.profile.hash = `local-${profile.pname}`
            localStorage.setItem('plugins/local', JSON.stringify(localPlugin))
            pluginComponent.engine.register(localPlugin)
            pluginComponent.appManager.activatePlugin(localPlugin.name)
          } }
          cancelLabel="Cancel"
          cancelFn={closeModal}
        >

          <div className="form-group">
            <label htmlFor="plugin-name">Plugin Name <small>(required)</small></label>
            <input
              className="form-control"
              onChange={e => pluginChangeHandler('pname', e.target.value)}
              value={plugin.pname}
              id="plugin-name"
              data-id="localPluginName"
              placeholder="Should be camelCase"
            />
          </div>
          <div className="form-group">
            <label htmlFor="plugin-displayname">Display Name</label>
            <input
              className="form-control"
              onChange={e => pluginChangeHandler('displayName', e.target.value)}
              value={plugin.displayName}
              id="plugin-displayname"
              data-id="localPluginDisplayName"
              placeholder="Name in the header"
            />
          </div>
          <div className="form-group">
            <label htmlFor="plugin-methods">Api (comma separated list of methods name)</label>
            <input
              className="form-control"
              onChange={e => pluginChangeHandler('methods', e.target.value)}
              value={plugin.methods}
              id="plugin-methods"
              data-id="localPluginMethods"
              placeholder="Name in the header"
            />
          </div>

          <div className="form-group">
            <label htmlFor="plugin-url">Url <small>(required)</small></label>
            <input
              className="form-control"
              onChange={e => pluginChangeHandler('url', e.target.value)}
              value={plugin.url}
              id="plugin-url"
              data-id="localPluginUrl"
              placeholder="ex: https://localhost:8000"
            />
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
    </Fragment>
  )
}

export default RootView
