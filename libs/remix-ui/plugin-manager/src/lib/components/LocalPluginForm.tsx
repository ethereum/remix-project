/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useReducer, useState } from 'react' // eslint-disable-line no-use-before-define
import { ModalDialog } from '@remix-ui/modal-dialog'
import { Toaster } from '@remix-ui/toaster'
import { IframePlugin, WebsocketPlugin } from '@remixproject/engine-web'

import { localPluginReducerActionType, localPluginToastReducer } from '../reducers/pluginManagerReducer'
import { canActivate, FormStateProps, PluginManagerComponent } from '../../types'

interface LocalPluginFormProps {
  closeModal: () => void
  visible: boolean
  pluginManager: PluginManagerComponent
}

const initialState: FormStateProps = {
  name: '',
  displayName: '',
  url: '',
  type: 'iframe',
  hash: '',
  methods: [],
  location: 'sidePanel',
  canActivate: []
}

const defaultProfile = {
  methods: [],
  location: 'sidePanel',
  type: 'iframe',
  name: '',
  displayName: '',
  url: '',
  hash: ''
}

function LocalPluginForm ({ closeModal, visible, pluginManager }: LocalPluginFormProps) {
  const [errorMsg, dispatchToastMsg] = useReducer(localPluginToastReducer, '')
  const [name, setName] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const [url, setUrl] = useState<string>('')
  const [type, setType] = useState<'iframe' | 'ws'>('iframe')
  const [location, setLocation] = useState<'sidePanel' | 'mainPanel' | 'none'>('sidePanel')
  const [methods, setMethods] = useState<string>('')
  const [canactivate, setCanactivate] = useState<string>('')

  useEffect(() => {
    const storagePlugin:FormStateProps = localStorage.getItem('plugins/local') ? JSON.parse(localStorage.getItem('plugins/local')) : defaultProfile
    setName(storagePlugin.name)
    setUrl(storagePlugin.url)
    setLocation(storagePlugin.location as 'sidePanel' | 'mainPanel' | 'none')
    setMethods(Array.isArray(storagePlugin.methods) ? storagePlugin.methods.join(',') : storagePlugin.methods)
    setType(storagePlugin.type)
    setDisplayName(storagePlugin.displayName)
    setCanactivate(Array.isArray(storagePlugin.canActivate) ? storagePlugin.canActivate.join(',') : storagePlugin.canActivate || '')
  }, [])

  const handleModalOkClick = async () => {
    try {
      if (!name) throw new Error('Plugin should have a name')
      if (pluginManager.appManager.getIds().includes(name)) {
        throw new Error('This name has already been used')
      }
      if (!location) throw new Error('Plugin should have a location')
      if (!url) throw new Error('Plugin should have an URL')
      const newMethods = typeof methods === 'string' ? methods.split(',').filter(val => val).map(val => { return val.trim() }) : []
      const targetPlugin = {
        name: name,
        displayName: displayName,
        description: '',
        documentation: '',
        events: [],
        hash: '',
        kind: '',
        methods: newMethods,
        url: url,
        type: type,
        location: location,
        icon: 'assets/img/localPlugin.webp',
        canActivate: typeof canactivate === 'string' ? canactivate.split(',').filter(val => val).map(val => { return val.trim() }) : []
      }
      const localPlugin = type === 'iframe' ? new IframePlugin(initialState) : new WebsocketPlugin(initialState)
      localPlugin.profile.hash = `local-${name}`
      targetPlugin.description = localPlugin.profile.description !== undefined ? localPlugin.profile.description : ''
      targetPlugin.events = localPlugin.profile.events !== undefined ? localPlugin.profile.events : []
      targetPlugin.kind = localPlugin.profile.kind !== undefined ? localPlugin.profile.kind : ''
      localPlugin.profile = { ...localPlugin.profile, ...targetPlugin }
      pluginManager.activateAndRegisterLocalPlugin(localPlugin)
    } catch (error) {
      const action: localPluginReducerActionType = { type: 'show', payload: `${error.message}` }
      dispatchToastMsg(action)
      console.log(error)
    }
  }

  return (
    <><ModalDialog
      handleHide={closeModal}
      id="pluginManagerLocalPluginModalDialog"
      hide={visible}
      title="Local Plugin"
      okLabel="OK"
      okFn={ handleModalOkClick }
      cancelLabel="Cancel"
      cancelFn={closeModal}
    >
      <form id="local-plugin-form">
        <div className="form-group">
          <label htmlFor="plugin-name">Plugin Name <small>(required)</small></label>
          <input
            className="form-control"
            onChange={e => setName(e.target.value)}
            value={ name || '' }
            id="plugin-name"
            data-id="localPluginName"
            placeholder="Should be camelCase" />
        </div>
        <div className="form-group">
          <label htmlFor="plugin-displayname">Display Name</label>
          <input
            className="form-control"
            onChange={e => setDisplayName(e.target.value)}
            value={ displayName || '' }
            id="plugin-displayname"
            data-id="localPluginDisplayName"
            placeholder="Name in the header" />
        </div>
        <div className="form-group">
          <label htmlFor="plugin-methods">Api (comma separated list of method names)</label>
          <input
            className="form-control"
            onChange={e => setMethods(e.target.value)}
            value={ methods || '' }
            id="plugin-methods"
            data-id="localPluginMethods"
            placeholder="Methods" />
        </div>
        <div className="form-group">
          <label htmlFor="plugin-methods">Plugins it can activate (comma separated list of plugin names)</label>
          <input
            className="form-control"
            onChange={e => setCanactivate(e.target.value)}
            value={ canactivate || '' }
            id="plugin-canactivate"
            data-id="localPluginCanActivate"
            placeholder="Plugin names" />
        </div>

        <div className="form-group">
          <label htmlFor="plugin-url">Url <small>(required)</small></label>
          <input
            className="form-control"
            onChange={e => setUrl(e.target.value)}
            value={ url || '' }
            id="plugin-url"
            data-id="localPluginUrl"
            placeholder="ex: https://localhost:8000" />
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
              checked={type === 'iframe'}
              onChange={(e) => setType(e.target.value as 'iframe' | 'ws')} />
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
              checked={type === 'ws'}
              onChange={(e) => setType(e.target.value as 'iframe' | 'ws')} />
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
              id="none"
              data-id='localPluginRadioButtonsidePanel'
              checked={location === 'sidePanel'}
              onChange={(e) => setLocation(e.target.value as 'sidePanel' | 'mainPanel' | 'none')} />
            <label className="form-check-label" htmlFor="sidePanel">Side Panel</label>
          </div>
          <div className="radio">
            <input
              className="form-check-input"
              type="radio"
              name="location"
              value="mainPanel"
              id="none"
              data-id='localPluginRadioButtonmainPanel'
              checked={location === 'mainPanel'}
              onChange={(e) => setLocation(e.target.value as 'sidePanel' | 'mainPanel' | 'none')} />
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
              checked={location === 'none'}
              onChange={(e) => setLocation(e.target.value as 'sidePanel' | 'mainPanel' | 'none')} />
            <label className="form-check-label" htmlFor="none">None</label>
          </div>
        </div>
      </form>
    </ModalDialog>
    {errorMsg ? <Toaster message={errorMsg} /> : null}
    </>
  )
}

export default LocalPluginForm
