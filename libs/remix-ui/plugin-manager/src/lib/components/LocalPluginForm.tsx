import { ModalDialog } from '@remix-ui/modal-dialog'
import { IframePlugin, WebsocketPlugin } from '@remixproject/engine-web'
import React from 'react'
import { FormStateProps, PluginManagerComponent } from '../../types'

interface LocalPluginFormProps {
  changeHandler: (propertyName: string, value: any) => void
  plugin: FormStateProps
  closeModal: () => void
  visible: boolean
  pluginManager: PluginManagerComponent
}

function LocalPluginForm ({ changeHandler, plugin, closeModal, visible, pluginManager }: LocalPluginFormProps) {
  return (
    <ModalDialog
      handleHide={closeModal}
      id="pluginManagerLocalPluginModalDialog"
      hide={visible}
      title="Local Plugin"
      okLabel="OK"
      okFn={() => {
        const profile = JSON.parse(localStorage.getItem('plugins/local')) || plugin
        if (!profile) return
        if (pluginManager.appManager.getIds().includes(profile.pname)) {
          throw new Error('This name has already been used')
        }
        if (!profile.location) throw new Error('Plugin should have a location')
        if (!profile.pname) throw new Error('Plugin should have a name')
        if (!profile.url) throw new Error('Plugin should have an URL')
        const localPlugin = profile.type === 'iframe' ? new IframePlugin(profile) : new WebsocketPlugin(profile)
        localPlugin.profile.hash = `local-${profile.pname}`
        localStorage.setItem('plugins/local', JSON.stringify(localPlugin))
        pluginManager.engine.register(localPlugin)
        pluginManager.appManager.activatePlugin(localPlugin.name)
      } }
      cancelLabel="Cancel"
      cancelFn={closeModal}
    >
      <form id="local-plugin-form">
        <div className="form-group">
          <label htmlFor="plugin-name">Plugin Name <small>(required)</small></label>
          <input
            className="form-control"
            onChange={e => changeHandler('pname', e.target.value)}
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
            onChange={e => changeHandler('displayName', e.target.value)}
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
            onChange={e => changeHandler('methods', e.target.value)}
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
            onChange={e => changeHandler('url', e.target.value)}
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
    </ModalDialog>
  )
}

export default LocalPluginForm
