import React, { useEffect } from "react";
import { gitActionsContext, pluginActionsContext } from "../../state/context";
import { gitPluginContext, loaderContext } from "../gitui";
import { CustomTooltip } from "@remix-ui/helper";

import { useIntl, FormattedMessage } from "react-intl";
import { CopyToClipboard } from "@remix-ui/clipboard";

export const GitHubCredentials = () => {
  const context = React.useContext(gitPluginContext)
  const pluginactions = React.useContext(pluginActionsContext)
  const loader = React.useContext(loaderContext)
  const actions = React.useContext(gitActionsContext)
  const [githubToken, setGithubToken] = React.useState('')
  const [githubUsername, setGithubUsername] = React.useState('')
  const [githubEmail, setGithubEmail] = React.useState('')
  const intl = useIntl()

  useEffect(() => {
    refresh()
  }, [loader.plugin, context.gitHubAccessToken, context.userEmails, context.gitHubUser])

  function handleChangeTokenState(e: string): void {
    setGithubToken(e)
  }

  function handleChangeUserNameState(e: string): void {
    setGithubUsername(e)
  }

  function handleChangeEmailState(e: string): void {
    setGithubEmail(e)
  }

  async function saveGithubToken() {
    await pluginactions.saveGitHubCredentials({
      username: githubUsername,
      email: githubEmail,
      token: githubToken
    })
  }

  async function refresh() {
    const credentials = await pluginactions.getGitHubCredentialsFromLocalStorage()
    if (!credentials) return
    setGithubToken(credentials.token || '')
    setGithubUsername(credentials.username || '')
    setGithubEmail(credentials.email || '')
  }

  function removeToken(): void {
    setGithubToken('')
    setGithubUsername('')
    setGithubEmail('')
    pluginactions.saveGitHubCredentials({
      username: '',
      email: '',
      token: ''
    })
  }

  return (
    <>
      <div className="input-group text-secondary mb-1 h6">
        <input type="password" value={githubToken} placeholder="GitHub token" className="form-control" name='githubToken' onChange={e => handleChangeTokenState(e.target.value)} />
        <div className="input-group-append">
          <CopyToClipboard content={githubToken} data-id='copyToClipboardCopyIcon' className='far fa-copy ml-1 p-2 mt-1' direction={"top"} />
        </div>
      </div>
      <input name='githubUsername' onChange={e => handleChangeUserNameState(e.target.value)} value={githubUsername} className="form-control mb-1" placeholder="Git username" type="text" id="githubUsername" />
      <input name='githubEmail' onChange={e => handleChangeEmailState(e.target.value)} value={githubEmail} className="form-control mb-1" placeholder="Git email" type="text" id="githubEmail" />
      <div className="d-flex justify-content-between">
        <button className="btn btn-primary w-100" onClick={saveGithubToken}>
          <FormattedMessage id="save" defaultMessage="Save" />
        </button>
        <button className="btn btn-danger far fa-trash-alt" onClick={removeToken}>
        </button>
      </div>
      <hr />
    </>
  );
}