import {CopyToClipboard} from '@remix-ui/clipboard'
import {CustomTooltip} from '@remix-ui/helper'
import React, {useEffect, useState} from 'react'
import {FormattedMessage, useIntl} from 'react-intl'
import {CorsproxySettingsProps} from '../types'

export function CorsproxySettings(props: CorsproxySettingsProps) {
  const [url, setUrl] = useState<string>('')
  const intl = useIntl()

  useEffect(() => {
    if (props.config) {
      const url = props.config.get('settings/corsproxy-url') || 'https://corsproxy.remixproject.org/'

      setUrl(url)
    }
  }, [props.config])

  const handleChangeUrlState = (event) => {
    setUrl(event.target.value)
  }

  const saveCorsproxy = () => {
    props.saveCorsproxy(url)
  }

  const removeToken = () => {
    setUrl('')
    props.removeCorsproxy()
  }

  return (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">
          <FormattedMessage id="settings.corsproxyTitle" />
        </h6>
        <FormattedMessage id="settings.corsproxyText" />
        <div className="p-1 pl-3">
          <b>npm install -g @drafish/cors-proxy</b>
        </div>
        <div className="p-1 pl-3">
          <b>cors-proxy start</b>
        </div>
        <div className="pt-2">
          <FormattedMessage
            id="settings.corsproxyText2"
          />
        </div>
        <div className="pt-2">
          <FormattedMessage
            id="settings.corsproxyText3"
            values={{
              a: (chunks) => (
                <a href="https://github.com/drafish/cors-proxy" target="_blank">
                  {chunks}
                </a>
              )
            }}
          />
        </div>
        
        <div>
          <label className="pt-2 mb-0 pb-0">
            <FormattedMessage id="settings.url" />:
          </label>
          <div className="text-secondary mb-0 h6">
            <input id="corsproxy" data-id="settingsTabCorsproxy" type="text" className="form-control" onChange={(e) => handleChangeUrlState(e)} value={url} />
            <div className="d-flex justify-content-end pt-2">
              <input className="btn btn-sm btn-primary ml-2" id="savecorsproxy" data-id="settingsTabSaveCorsproxy" onClick={saveCorsproxy} value={intl.formatMessage({id: 'settings.save'})} type="button"></input>
              <CustomTooltip tooltipText={<FormattedMessage id="settings.deleteCorsproxy" />} tooltipClasses="text-nowrap" tooltipId="removecorsproxyTooltip" placement="top-start">
                <button className="btn btn-sm btn-secondary ml-2" id="removecorsproxy" data-id="settingsTabRemoveCorsproxy" onClick={removeToken}>
                  <FormattedMessage id="settings.remove" />
                </button>
              </CustomTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
