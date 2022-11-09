import { CopyToClipboard } from '@remix-ui/clipboard'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { EtherscanSettingsProps } from '../types'
import { etherscanTokenTitle, etherscanAccessTokenText, etherscanAccessTokenText2, etherscanTokenLink } from './constants'


export function EtherscanSettings (props: EtherscanSettingsProps) {
  const [etherscanToken, setEtherscanToken] = useState<string>("")
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
        <h6 className="card-title"><FormattedMessage id='settings.etherscanTokenTitle' defaultMessage={etherscanTokenTitle} /></h6>
        <p className="mb-1"><FormattedMessage id='settings.etherscanAccessTokenText' defaultMessage={etherscanAccessTokenText} /></p>
        <p className=""><FormattedMessage id='settings.etherscanAccessTokenText2' defaultMessage={etherscanAccessTokenText2} /></p>
        <p className="mb-1"><a className="text-primary" target="_blank" href={etherscanTokenLink}>{etherscanTokenLink}</a></p>
        <div>
          <label className="mb-0 pb-0">TOKEN:</label>
          <div className="input-group text-secondary mb-0 h6">
            <input id="etherscanAccessToken" data-id="settingsTabEtherscanAccessToken" type="password" className="form-control" onChange={(e) => handleChangeTokenState(e)} value={ etherscanToken } />
            <div className="input-group-append">
              <CopyToClipboard content={etherscanToken} data-id='copyToClipboardCopyIcon' className='far fa-copy ml-1 p-2 mt-1' direction={"top"} />
            </div>
          </div>
        </div>
        <div>
          <div className="text-secondary mb-0 h6">
            <div className="d-flex justify-content-end pt-2">
              <input className="btn btn-sm btn-primary ml-2" id="saveetherscantoken" data-id="settingsTabSaveEtherscanToken" onClick={saveEtherscanToken} value={intl.formatMessage({id: 'settings.save', defaultMessage: 'Save'})} type="button" disabled={etherscanToken === ''}></input>
              <CustomTooltip
                tooltipText="Delete Etherscan token"
                tooltipClasses="text-nowrap"
                tooltipId="removeetherscantokenTooltip"
                placement="left-start"
              >
                <button className="btn btn-sm btn-secondary ml-2" id="removeetherscantoken" data-id="settingsTabRemoveEtherscanToken" title="Delete Etherscan token" onClick={removeToken}>
                <FormattedMessage id='settings.remove' defaultMessage='Remove' />
              </button></CustomTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
