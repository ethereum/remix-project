import { CopyToClipboard } from '@remix-ui/clipboard'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { SindriSettingsProps } from '../types'
import { sindriAccessTokenLink } from './constants'

export function SindriSettings(props: SindriSettingsProps) {
  const [sindriToken, setSindriToken] = useState<string>('')
  const intl = useIntl()

  useEffect(() => {
    if (props.config) {
      const sindriToken = props.config.get('settings/sindri-access-token') || ''
      setSindriToken(sindriToken)
    }
  }, [props.config])

  const handleChangeTokenState = (event) => {
    const token = event.target.value ? event.target.value.trim() : event.target.value
    setSindriToken(token)
  }

  // api key settings
  const saveSindriToken = () => {
    props.saveToken(sindriToken)
  }

  const removeToken = () => {
    setSindriToken('')
    props.removeToken()
  }

  return (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">
          <FormattedMessage id="settings.sindriAccessTokenTitle" />
        </h6>
        <p className="mb-1">
          <FormattedMessage id="settings.sindriAccessTokenText" />
        </p>
        <p className="">
          <FormattedMessage id="settings.sindriAccessTokenText2" />
        </p>
        <p className="mb-1">
          <a className="text-primary" target="_blank" href={sindriAccessTokenLink}>
            {sindriAccessTokenLink}
          </a>
        </p>
        <div>
          <label className="mb-0 pb-0">
            <FormattedMessage id="settings.token" />:
          </label>
          <div className="input-group text-secondary mb-0 h6">
            <input id="sindriaccesstoken" data-id="settingsTabSindriAccessToken" type="password" className="form-control" onChange={(e) => handleChangeTokenState(e)} value={sindriToken} />
            <div className="input-group-append">
              <CopyToClipboard tip={intl.formatMessage({ id: 'settings.copy' })} content={sindriToken} data-id="copyToClipboardCopyIcon" className="far fa-copy ml-1 p-2 mt-1" direction={'top'} />
            </div>
          </div>
        </div>
        <div>
          <div className="text-secondary mb-0 h6">
            <div className="d-flex justify-content-end pt-2">
              <input className="btn btn-sm btn-primary ml-2" id="savesindritoken" data-id="settingsTabSaveSindriToken" onClick={saveSindriToken} value={intl.formatMessage({ id: 'settings.save' })} type="button"></input>
              <CustomTooltip tooltipText={<FormattedMessage id="settings.deleteSindriCredentials" />} tooltipClasses="text-nowrap" tooltipId="removesindritokenTooltip" placement="top-start">
                <button className="btn btn-sm btn-secondary ml-2" id="removesindritoken" data-id="settingsTabRemoveSindriToken" onClick={removeToken}>
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
