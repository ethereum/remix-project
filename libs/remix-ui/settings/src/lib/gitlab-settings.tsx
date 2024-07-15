import { CopyToClipboard } from '@remix-ui/clipboard'
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { GithubSettingsProps } from '../types'
import { gitlabTokenLink } from './constants'

export function GitlabSettings(props: GithubSettingsProps) {
  const [gitlabToken, setGitlabToken] = useState<string>('')
  const [gitlabUserName, setGitlabUsername] = useState<string>('')
  const [gitlabEmail, setGitlabEmail] = useState<string>('')
  const intl = useIntl()

  useEffect(() => {
    if (props.config) {
      const gitlabToken = props.config.get('settings/gitlab-token') || ''
      const gitlabUserName = props.config.get('settings/gitlab-user-name') || ''
      const gitlabEmail = props.config.get('settings/gitlab-email') || ''

      setGitlabToken(gitlabToken)
      setGitlabUsername(gitlabUserName)
      setGitlabEmail(gitlabEmail)
    }
  }, [props.config])

  const handleChangeTokenState = (event) => {
    const token = event.target.value ? event.target.value.trim() : event.target.value
    setGitlabToken(token)
  }

  const handleChangeUserNameState = (event) => {
    setGitlabUsername(event.target.value)
  }

  const handleChangeEmailState = (event) => {
    setGitlabEmail(event.target.value)
  }

  // api key settings
  const saveGitlabToken = () => {
    props.saveToken(gitlabToken, gitlabUserName, gitlabEmail)
  }

  const removeToken = () => {
    setGitlabToken('')
    setGitlabUsername('')
    setGitlabEmail('')
    props.removeToken()
  }

  return (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">
          <FormattedMessage id="settings.gitlabTokenTitle" />
        </h6>
        <p className="mb-1">
          <FormattedMessage id="settings.gitlabTokenText" />
        </p>
        <p className="">
          <FormattedMessage id="settings.gitlabTokenText2" />
        </p>
        <p className="mb-1">
          <a className="text-primary" target="_blank" href={gitlabTokenLink}>
            {gitlabTokenLink}
          </a>
        </p>
        <div>
          <label className="mb-0 pb-0">
            <FormattedMessage id="settings.token" />:
          </label>
          <div className="input-group text-secondary mb-0 h6">
            <input id="gitlabtoken" data-id="settingsTabGitlabToken" type="password" className="form-control" onChange={(e) => handleChangeTokenState(e)} value={gitlabToken} />
            <div className="input-group-append">
              <CopyToClipboard tip={intl.formatMessage({ id: 'settings.copy' })} content={gitlabToken} data-id="copyToClipboardCopyIcon" className="far fa-copy ml-1 p-2 mt-1" direction={'top'} />
            </div>
          </div>
        </div>
        <div>
          <label className="pt-2 mb-0 pb-0">
            <FormattedMessage id="settings.username" />:
          </label>
          <div className="text-secondary mb-0 h6">
            <input id="gitlabusername" data-id="settingsTabGitlabUsername" type="text" className="form-control" onChange={(e) => handleChangeUserNameState(e)} value={gitlabUserName} />
          </div>
        </div>
        <div>
          <label className="pt-2 mb-0 pb-0">
            <FormattedMessage id="settings.email" />:
          </label>
          <div className="text-secondary mb-0 h6">
            <input id="gitlabemail" data-id="settingsTabGitlabEmail" type="text" className="form-control" onChange={(e) => handleChangeEmailState(e)} value={gitlabEmail} />
            <div className="d-flex justify-content-end pt-2">
              <input className="btn btn-sm btn-primary ml-2" id="savegitlabtoken" data-id="settingsTabSaveGitlabToken" onClick={saveGitlabToken} value={intl.formatMessage({ id: 'settings.save' })} type="button"></input>
              <CustomTooltip tooltipText={<FormattedMessage id="settings.deleteGitlabCredentials" />} tooltipClasses="text-nowrap" tooltipId="removegitlabtokenTooltip" placement="top-start">
                <button className="btn btn-sm btn-secondary ml-2" id="removegitlabtoken" data-id="settingsTabRemoveGitlabToken" onClick={removeToken}>
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
