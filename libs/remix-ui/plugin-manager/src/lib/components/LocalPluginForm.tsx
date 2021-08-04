import { ModalDialog } from '@remix-ui/modal-dialog'
import { Toaster } from '@remix-ui/toaster'
import { IframePlugin, WebsocketPlugin } from '@remixproject/engine-web'
import React, { useState } from 'react'
import { FormStateProps, PluginManagerComponent } from '../../types'

interface LocalPluginFormProps {
  changeHandler: (propertyName: string, value: any) => void
  plugin: FormStateProps
  closeModal: () => void
  visible: boolean
  pluginManager: PluginManagerComponent
}

function LocalPluginForm ({ changeHandler, plugin, closeModal, visible, pluginManager }: LocalPluginFormProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const handleModalOkClick = async () => {
    try {
      const profile = JSON.parse(localStorage.getItem('plugins/local')) || plugin
      // eslint-disable-next-line no-debugger
      debugger
      if (!profile) return
      if (profile.profile) {
        if (pluginManager.appManager.getIds().includes(profile.profile.name)) {
          throw new Error('This name has already been used')
        }
        // if (!profile.profile.location) throw new Error('Plugin should have a location')
        // if (!profile.profile.pname) throw new Error('Plugin should have a name')
        // if (!profile.profile.url) throw new Error('Plugin should have an URL')
        // const localPlugin = profile.profile.type === 'iframe' ? new IframePlugin(profile) : new WebsocketPlugin(profile)
        // localPlugin.profile.hash = `local-${profile.profile.pname}`
        // localStorage.setItem('plugins/local', JSON.stringify(localPlugin))
        // pluginManager.engine.register(localPlugin)
        // await pluginManager.appManager.activatePlugin(localPlugin.name)
      } else {
        if (pluginManager.appManager.getIds().includes(profile.name)) {
          throw new Error('This name has already been used')
        }
        if (!profile.location) throw new Error('Plugin should have a location')
        if (!profile.name) throw new Error('Plugin should have a name')
        if (!profile.url) throw new Error('Plugin should have an URL')
        const localPlugin = profile.type === 'iframe' ? new IframePlugin(profile) : new WebsocketPlugin(profile)
        localPlugin.profile.hash = `local-${profile.name}`
        pluginManager.engine.register(localPlugin)
        await pluginManager.appManager.activatePlugin(localPlugin.profile.name)
        localStorage.setItem('plugins/local', JSON.stringify(localPlugin))
      }
    } catch (error) {
      console.error(error)
      setErrorMsg(error.message)
    }
  }
  return (
    <><ModalDialog
      handleHide={closeModal}
      id="pluginManagerLocalPluginModalDialog"
      hide={visible}
      title="Local Plugin"
      okLabel="OK"
      okFn={handleModalOkClick}
      cancelLabel="Cancel"
      cancelFn={closeModal}
    >
      <form id="local-plugin-form">
        <div className="form-group">
          <label htmlFor="plugin-name">Plugin Name <small>(required)</small></label>
          <input
            className="form-control"
            onChange={e => changeHandler('name', e.target.value)}
            value={plugin.name}
            id="plugin-name"
            data-id="localPluginName"
            placeholder="Should be camelCase" />
        </div>
        <div className="form-group">
          <label htmlFor="plugin-displayname">Display Name</label>
          <input
            className="form-control"
            onChange={e => changeHandler('displayName', e.target.value)}
            value={plugin.displayName}
            id="plugin-displayname"
            data-id="localPluginDisplayName"
            placeholder="Name in the header" />
        </div>
        <div className="form-group">
          <label htmlFor="plugin-methods">Api (comma separated list of methods name)</label>
          <input
            className="form-control"
            onChange={e => changeHandler('methods', e.target.value)}
            value={plugin.methods}
            id="plugin-methods"
            data-id="localPluginMethods"
            placeholder="Name in the header" />
        </div>

        <div className="form-group">
          <label htmlFor="plugin-url">Url <small>(required)</small></label>
          <input
            className="form-control"
            onChange={e => changeHandler('url', e.target.value)}
            value={plugin.url}
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
              checked={plugin.type === 'iframe'}
              onChange={(e) => changeHandler('type', e.target.value)} />
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
              onChange={(e) => changeHandler('type', e.target.value)} />
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
              onChange={(e) => changeHandler('location', e.target.value)} />
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
              onChange={(e) => changeHandler('location', e.target.value)} />
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
              onChange={(e) => changeHandler('location', e.target.value)} />
            <label className="form-check-label" htmlFor="none">None</label>
          </div>
        </div>
      </form>
    </ModalDialog><Toaster message={`Cannot create Plugin : ${errorMsg}`} timeOut={3000} /></>
  )
}

export default LocalPluginForm
