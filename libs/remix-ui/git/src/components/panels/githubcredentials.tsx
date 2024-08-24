import React, { useEffect } from "react";
import { gitActionsContext, pluginActionsContext } from "../../state/context";
import { gitPluginContext, loaderContext } from "../gitui";
import { CustomTooltip } from "@remix-ui/helper";

import { useIntl, FormattedMessage } from "react-intl";
import { CopyToClipboard } from "@remix-ui/clipboard";
import { gitMatomoEventTypes } from "../../types";
import { sendToMatomo } from "../../lib/pluginActions";

export const GitHubCredentials = () => {
  const context = React.useContext(gitPluginContext)
  const pluginactions = React.useContext(pluginActionsContext)
  const loader = React.useContext(loaderContext)
  const actions = React.useContext(gitActionsContext)
  const [githubToken, setGithubToken] = React.useState('')
  const [githubUsername, setGithubUsername] = React.useState('')
  const [githubEmail, setGithubEmail] = React.useState('')
  const [scopeWarning, setScopeWarning] = React.useState(false)
  const intl = useIntl()

  useEffect(() => {
    refresh()
    if (context.gitHubUser) {
      setScopeWarning(!(context.gitHubScopes
        && context.gitHubScopes.includes('repo')
        && context.gitHubScopes.includes('read:user')
        && context.gitHubScopes.includes('user:email')
        && context.gitHubScopes.includes('gist')))
    } else {
      setScopeWarning(false)
    }
  }, [loader.plugin, context.gitHubAccessToken, context.userEmails, context.gitHubUser, context.gitHubScopes])

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
    await sendToMatomo(gitMatomoEventTypes.SAVEMANUALGITHUBCREDENTIALS)
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
      <label className="text-uppercase">Enter GitHub credentials manually</label>
      <br></br>

      <label>Git username&nbsp;<small>(required)</small></label>
      <input data-id='gitubUsername' name='githubUsername' onChange={e => handleChangeUserNameState(e.target.value)} value={githubUsername} className="form-control mb-3" placeholder="* Git username" type="text" id="githubUsername" />
      <label>Git email&nbsp;<small>(required)</small></label>
      <input data-id='githubEmail' name='githubEmail' onChange={e => handleChangeEmailState(e.target.value)} value={githubEmail} className="form-control mb-3" placeholder="* Git email" type="text" id="githubEmail" />
      <label>GitHub token&nbsp;<small>(optional)</small></label>
      <div className="input-group text-secondary mb-3 h6">
        <input data-id='githubToken' type="password" autoComplete="off" value={githubToken} placeholder="GitHub token" className="form-control" name='githubToken' onChange={e => handleChangeTokenState(e.target.value)} />
        <div className="input-group-append">
          <CopyToClipboard content={githubToken} data-id='copyToClipboardCopyIcon' className='far fa-copy ml-1 p-2 mt-1' direction={"top"} />
        </div>
      </div>
      <div className="d-flex justify-content-between">
        <button data-id='saveGitHubCredentials' className="btn btn-primary w-100" onClick={saveGithubToken}>
          <FormattedMessage id="save" defaultMessage="Save" />
        </button>
        <button className="btn btn-danger far fa-trash-alt" onClick={removeToken}>
        </button>
      </div>
      {scopeWarning ?
        <div className="text-warning">Your GitHub token may or may not have the correct permissions. Remix can't verify the permissions when using your own token. Please use the login with GitHub feature.</div> : null}
      <hr />
    </>
  );
}
