import { CopyToClipboard } from '@remix-ui/clipboard'
import React, { useState } from 'react'
import { GithubSettingsProps } from '../types'

export function GithubSettings (props: GithubSettingsProps) {
  const [githubToken, setGithubToken] = useState<string>("")
  const [githubUserName, setGithubUsername] = useState<string>("")
  const [githubEmail, setGithubEmail] = useState<string>("")

  const handleChangeTokenState = (event) => {
    setGithubToken(event.target.value)
  }

  const handleChangeUserNameState = (event) => {
    setGithubUsername(event.target.value)
  }

  const handleChangeEmailState = (event) => {
    setGithubEmail(event.target.value)
  }

  // api key settings
  const saveGithubToken = () => {
    props.saveTokenToast(githubToken, githubUserName, githubEmail)
  }

  const removeToken = () => {
    setGithubToken('')
    props.removeTokenToast()
  }
  
  return (
    <div className="border-top">
      <div className="card-body pt-3 pb-2">
        <h6 className="card-title">GitHub Access Token</h6>
        <p className="mb-1">Manage the access token used to publish to Gist and retrieve GitHub contents.</p>
        <p className="">Go to github token page (link below) to create a new token and save it in Remix. Make sure this token has only \'create gist\' permission.</p>
        <p className="mb-1"><a className="text-primary" target="_blank" href="https://github.com/settings/tokens">https://github.com/settings/tokens</a></p>
        <div>
          <label>TOKEN:</label>
          <div className="input-group text-secondary mb-0 h6">
            <input id="gistaccesstoken" data-id="settingsTabGistAccessToken" type="password" className="form-control" onChange={(e) => handleChangeTokenState(e)} value={ githubToken } />
            <div className="input-group-append">
              <CopyToClipboard content={githubToken} data-id='copyToClipboardCopyIcon' className='far fa-copy ml-1 p-2 mt-1' direction={"top"} />
            </div>
          </div>
        </div>
        <div>
          <label>USERNAME:</label>
          <div className="text-secondary mb-0 h6">
            <input id="githubusername" data-id="settingsTabGithubUsername" type="password" className="form-control" onChange={(e) => handleChangeUserNameState(e)} value={ githubUserName } />
          </div>
        </div>
        <div>
          <label>EMAIL:</label>
          <div className="text-secondary mb-0 h6">
            <input id="githubemail" data-id="settingsTabGithubEmail" type="password" className="form-control" onChange={(e) => handleChangeEmailState(e)} value={ githubEmail } />
            <div className="d-flex justify-content-end pt-2">
              <input className="btn btn-sm btn-primary ml-2" id="savegisttoken" data-id="settingsTabSaveGistToken" onClick={saveGithubToken} value="Save" type="button" disabled={githubToken === ''}></input>
              <button className="btn btn-sm btn-secondary ml-2" id="removegisttoken" data-id="settingsTabRemoveGistToken" title="Delete GitHub Credentials" onClick={removeToken}>Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}