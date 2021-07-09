import React, { FormEvent, MouseEvent, useState } from 'react'
import { FormStateProps } from '../../types'

interface RadioSelectionformState {
  pluginType: string
  inputLabel: string
  radioLabel: string
  radioChecked?: boolean
  updateProfile: (key: string, e: MouseEvent) => void
}

interface LocalPluginFormProps {
  formSubmitHandler: (event: FormEvent, formData: FormStateProps) => void
}

const initialState: FormStateProps = {
  name: '',
  displayName: '',
  url: '',
  type: 'iframe',
  hash: '',
  methods: '',
  location: 'sidePanel'
}

function LocalPluginForm ({ formSubmitHandler }: LocalPluginFormProps) {
  const [plugin, setPlugin] = useState(initialState)
  // const [name, setName] = useState('')
  // const [displayName, setDisplayName] = useState('')
  // const [methods, setMethods] = useState('')
  // const [url, setUrl] = useState('')
  // const [type, setType] = useState()
  // const [location, setLocation] = useState()

  function pluginChangeHandler<P extends keyof FormStateProps> (formProps: P, value: FormStateProps[P]) {
    setPlugin({ ...plugin, [formProps]: value })
  }

  // function handleSubmit (e) {
  //   console.log('Logging the form submit event', e)
  //   console.log('state of the plugin', plugin)
  // }

  // const onValueChange = (event: any) => {
  //   const value = event.target.type === 'radio' ? event.target.checked : event.target.value
  //   const name = event.target.name
  //   if (name === 'name') {
  //     setName(value)
  //   } else if (name === 'displayName') {
  //     setDisplayName(value)
  //   } else if (name === 'methods') {
  //     setMethods(value)
  //   } else if (name === 'url') {
  //     setUrl(value)
  //   } else if (name === 'type') {
  //     setType(value)
  //   } else if (name === 'location') {
  //     setLocation(value)
  //   }
  // }
  return (
    <form id="local-plugin-form" onSubmit={(e) => formSubmitHandler(e, plugin)}>
      <div className="form-group">
        <label htmlFor="plugin-name">Plugin Name <small>(required)</small></label>
        <input className="form-control" onChange={e => pluginChangeHandler('name', e.target.value)} value={plugin.name} id="plugin-name" data-id="localPluginName" placeholder="Should be camelCase"/>
      </div>
      <div className="form-group">
        <label htmlFor="plugin-displayname">Display Name</label>
        <input className="form-control" onChange={e => pluginChangeHandler('displayName', e.target.value)} value={plugin.displayName} id="plugin-displayname" data-id="localPluginDisplayName" placeholder="Name in the header"/>
      </div>
      <div className="form-group">
        <label htmlFor="plugin-methods">Api (comma separated list of methods name)</label>
        <input className="form-control" onChange={e => pluginChangeHandler('methods', e.target.value)} value={plugin.methods} id="plugin-methods" data-id="localPluginMethods" placeholder="Name in the header"/>
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
            onChange={(e) => pluginChangeHandler('type', e.target.value)}
          />
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
            onChange={(e) => pluginChangeHandler('type', e.target.value)}
          />
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
            onChange={(e) => pluginChangeHandler('location', e.target.value)}
          />
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
            onChange={(e) => pluginChangeHandler('location', e.target.value)}
          />
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
            onChange={(e) => pluginChangeHandler('location', e.target.value)}
          />
          <label className="form-check-label" htmlFor="none">None</label>
        </div>
      </div>
    </form>
  )
}

export default LocalPluginForm
