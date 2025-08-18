import { CopyToClipboard } from '@remix-ui/clipboard'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { EtherscanSettingsProps } from '../types'
import { etherscanTokenLink } from './constants'

export function EtherscanSettings(props: EtherscanSettingsProps) {
  const [etherscanToken, setEtherscanToken] = useState<string>('')
  const intl = useIntl()

  useEffect(() => {
    if (props.config) {
      const etherscanToken = props.config.get('settings/etherscan-access-token') || ''
      setEtherscanToken(etherscanToken)
    }
  }, [props.config])

  const handleChangeTokenState = (event) => {
    setEtherscanToken(event.target.value)
  }

  // api key settings
  const saveEtherscanToken = () => {
    props.saveToken(etherscanToken)
  }

  const removeToken = () => {
    setEtherscanToken('')
    props.removeToken()
  }

  return (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">
          <FormattedMessage id="settings.etherscanTokenTitle" />
        </h6>
        <p className="mb-1">
          <FormattedMessage id="settings.etherscanAccessTokenText" />
        </p>
        <p className="">
          <FormattedMessage id="settings.etherscanAccessTokenText2" />
        </p>
        <p className="mb-1">
          <a className="text-primary" target="_blank" href={etherscanTokenLink}>
            {etherscanTokenLink}
          </a>
        </p>
        <div>
          <label className="mb-0 pb-0">
            <FormattedMessage id="settings.token" />:
          </label>
          <div className="input-group text-secondary mb-0 h6">
            <input
              id="etherscanAccessToken"
              data-id="settingsTabEtherscanAccessToken"
              type="password"
              className="form-control"
              onChange={(e) => handleChangeTokenState(e)}
              value={etherscanToken}
            />
            <div className="input-group-append">
              <CopyToClipboard
                tip={intl.formatMessage({ id: 'settings.copy' })}
                content={etherscanToken}
                data-id="copyToClipboardCopyIcon"
                className="far fa-copy ms-1 p-2 mt-1"
                direction={'top'}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="text-secondary mb-0 h6">
            <div className="d-flex justify-content-end pt-2">
              <input
                className="btn btn-sm btn-primary ms-2"
                id="saveetherscantoken"
                data-id="settingsTabSaveEtherscanToken"
                onClick={saveEtherscanToken}
                value={intl.formatMessage({ id: 'settings.save' })}
                type="button"
                disabled={etherscanToken === ''}
              ></input>
              <CustomTooltip
                tooltipText={<FormattedMessage id="settings.deleteEtherscanToken" />}
                tooltipClasses="text-nowrap"
                tooltipId="removeetherscantokenTooltip"
                placement="left-start"
              >
                <button
                  className="btn btn-sm btn-secondary ms-2"
                  id="removeetherscantoken"
                  data-id="settingsTabRemoveEtherscanToken"
                  title="Delete Etherscan token"
                  onClick={removeToken}
                >
                  <FormattedMessage id="settings.remove" />
                </button>
              </CustomTooltip>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex pt-3">
        <input
          className="btn btn-sm btn-primary"
          id="saveetherscantoken"
          data-id="settingsTabSaveEtherscanToken"
          onClick={saveEtherscanToken}
          value={intl.formatMessage({ id: 'settings.save' })}
          type="button"
        ></input>
      </div>
    </>
  )
}
