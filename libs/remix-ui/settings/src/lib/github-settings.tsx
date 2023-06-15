import { CopyToClipboard } from '@remix-ui/clipboard'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { GithubSettingsProps } from '../types'
import { gitAccessTokenLink } from './constants'


export function GithubSettings (props: GithubSettingsProps) {
  const [githubToken, setGithubToken] = useState<string>("")
  const [githubUserName, setGithubUsername] = useState<string>("")
  const [githubEmail, setGithubEmail] = useState<string>("")
  const intl = useIntl()

  useEffect(() => {
    if (props.config) {
      const githubToken = props.config.get('settings/gist-access-token') || ''
      const githubUserName = props.config.get('settings/github-user-name') || ''
      const githubEmail = props.config.get('settings/github-email') || ''

      setGithubToken(githubToken)
      setGithubUsername(githubUserName)
      setGithubEmail(githubEmail)
    }
  }, [props.config])

  const handleChangeTokenState = (event) => {
    const token = event.target.value ? event.target.value.trim() : event.target.value
    setGithubToken(token)
  }

  const handleChangeUserNameState = (event) => {
    setGithubUsername(event.target.value)
  }

  const handleChangeEmailState = (event) => {
    setGithubEmail(event.target.value)
  }

  // api key settings
  const saveGithubToken = () => {
    props.saveToken(githubToken, githubUserName, githubEmail)
  }

  const removeToken = () => {
    setGithubToken('')
    setGithubUsername('')
    setGithubEmail('')
    props.removeToken()
  }

  return (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title"><FormattedMessage id='settings.gitAccessTokenTitle' /></h6>
        <p className="mb-1"><FormattedMessage id='settings.gitAccessTokenText' /></p>
        <p className=""><FormattedMessage id='settings.gitAccessTokenText2' /></p>
        <p className="mb-1"><a className="text-primary" target="_blank" href={gitAccessTokenLink}>{gitAccessTokenLink}</a></p>
        <div>
          <label className="mb-0 pb-0">TOKEN:</label>
          <div className="input-group text-secondary mb-0 h6">
            <input id="gistaccesstoken" data-id="settingsTabGistAccessToken" type="password" className="form-control" onChange={(e) => handleChangeTokenState(e)} value={ githubToken } />
            <div className="input-group-append">
              <CopyToClipboard content={githubToken} data-id='copyToClipboardCopyIcon' className='far fa-copy ml-1 p-2 mt-1' direction={"top"} />
            </div>
          </div>
        </div>
        <div>
          <label className="pt-2 mb-0 pb-0">USERNAME:</label>
          <div className="text-secondary mb-0 h6">
            <input id="githubusername" data-id="settingsTabGithubUsername" type="text" className="form-control" onChange={(e) => handleChangeUserNameState(e)} value={ githubUserName } />
          </div>
        </div>
        <div>
          <label className="pt-2 mb-0 pb-0">EMAIL:</label>
          <div className="text-secondary mb-0 h6">
            <input id="githubemail" data-id="settingsTabGithubEmail" type="text" className="form-control" onChange={(e) => handleChangeEmailState(e)} value={ githubEmail } />
            <div className="d-flex justify-content-end pt-2">
              <input className="btn btn-sm btn-primary ml-2" id="savegisttoken" data-id="settingsTabSaveGistToken" onClick={saveGithubToken} value={intl.formatMessage({ id: 'settings.save' })} type="button"></input>
              <CustomTooltip
                tooltipText="Delete Github Credentials"
                tooltipClasses="text-nowrap"
                tooltipId="removegisttokenTooltip"
                placement="top-start"
              >
                <button className="btn btn-sm btn-secondary ml-2" id="removegisttoken" data-id="settingsTabRemoveGistToken" onClick={removeToken}>
                  <FormattedMessage id='settings.remove' />
                </button>
              </CustomTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
