import React, { useEffect, useRef, useState, useCallback } from "react";
import { gitActionsContext, pluginActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import axios from "axios";
import { CopyToClipboard } from "@remix-ui/clipboard";
import { sendToMatomo } from "../../lib/pluginActions";
import { gitMatomoEventTypes } from "../../types";
import { endpointUrls } from "@remix-endpoints-helper";
import isElectron from "is-electron";
import { set } from "lodash";
import { use } from "chai";

export const GetDeviceCode = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const pluginActions = React.useContext(pluginActionsContext)
  const [gitHubResponse, setGitHubResponse] = React.useState<any>(null)
  const [authorized, setAuthorized] = React.useState<boolean>(false)
  const [popupError, setPopupError] = useState(false)
  const [desktopIsLoading, setDesktopIsLoading] = React.useState<boolean>(false)

  const popupRef = useRef<Window | null>(null)

  // Dynamically select the GitHub OAuth client ID based on the hostname
  const getClientId = async () => {
    const host = isElectron() ? 'desktop' : window.location.hostname
    // fetch it with axios from `${endpointUrls.gitHubLoginProxy}/client-id?host=${host}`
    try {
      const response = await axios.get(`${endpointUrls.gitHubLoginProxy}/client/${host}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      return response.data.client_id
    }
    catch (error) {
      throw new Error('Failed to fetch GitHub client ID')
    }

  }

  const openPopupLogin = useCallback(async () => {

    if (isElectron()) {
      setDesktopIsLoading(true)
      pluginActions.loginWithGitHub()
      return
    }

    const clientId = await getClientId()
    const redirectUri = `${window.location.origin}/?source=github`
    const scope = 'repo gist user:email read:user'

    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`

    const popup = window.open(url, '_blank', 'width=600,height=700')
    if (!popup) {
      console.warn('Popup blocked or failed to open, falling back to device code flow.')
      await getDeviceCodeFromGitHub()
      return
    }
    popupRef.current = popup

    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
        const token = event.data.token
        await pluginActions.saveToken(token)
        await actions.loadGitHubUserFromToken()
        setAuthorized(true)
        await sendToMatomo(gitMatomoEventTypes.CONNECTTOGITHUBSUCCESS)
        window.removeEventListener('message', messageListener)
        popup?.close()
      } else if (event.data.type === 'GITHUB_AUTH_FAILURE') {
        setPopupError(true)
        window.removeEventListener('message', messageListener)
        popup?.close()
      }
    }

    window.addEventListener('message', messageListener)
  }, [actions, pluginActions])

  const getDeviceCodeFromGitHub = async () => {
    setDesktopIsLoading(false)
    setPopupError(false)
    await sendToMatomo(gitMatomoEventTypes.GETGITHUBDEVICECODE)
    setAuthorized(false)
    // Send a POST request
    const response = await axios({
      method: 'post',
      url: `${endpointUrls.github}/login/device/code`,
      data: {
        client_id: '2795b4e41e7197d6ea11',
        scope: 'repo gist user:email read:user'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    // convert response to json
    const githubrespone = await response.data;

    setGitHubResponse(githubrespone)
  }

  const connectApp = async () => {
    await sendToMatomo(gitMatomoEventTypes.CONNECTTOGITHUB)
    // poll https://github.com/login/oauth/access_token
    const accestokenresponse = await axios({
      method: 'post',
      url: `${endpointUrls.github}/login/oauth/access_token`,
      data: {
        client_id: '2795b4e41e7197d6ea11',
        device_code: gitHubResponse.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    // convert response to json
    const response = await accestokenresponse.data;

    if (response.access_token) {
      setAuthorized(true)
      await sendToMatomo(gitMatomoEventTypes.CONNECTTOGITHUBSUCCESS)
      await pluginActions.saveToken(response.access_token)
      await actions.loadGitHubUserFromToken()
    } else {
      await sendToMatomo(gitMatomoEventTypes.CONNECTTOGITHUBFAIL)
    }
  }

  useEffect(() => {
    if (context.gitHubUser && context.gitHubUser.isConnected) {
      setDesktopIsLoading(false)
    }
  },[context.gitHubUser])

  const disconnect = async () => {
    await sendToMatomo(gitMatomoEventTypes.DISCONNECTFROMGITHUB)
    setAuthorized(false)
    setGitHubResponse(null)
    await pluginActions.saveToken(null)
    await actions.loadGitHubUserFromToken()
  }

  return (
    <>
      {(context.gitHubUser && context.gitHubUser.isConnected) ? null : <>
        <label className="text-uppercase">Connect to GitHub</label>
        <button className='btn btn-secondary mt-1 w-100' onClick={openPopupLogin}>
          <i className="fab fa-github mr-1"></i>Login with GitHub
        </button>
        {popupError && !gitHubResponse && !authorized && (
          <div className="alert alert-warning mt-2" role="alert">
            GitHub login failed. You can continue using another method.
            <button className='btn btn-outline-primary btn-sm mt-2 w-100' onClick={getDeviceCodeFromGitHub}>
              Use another method
            </button>
          </div>
        )}
        {desktopIsLoading && <div className="text-center mt-2">
          <i className="fas fa-spinner fa-spin fa-2x mt-1"></i>
          <div className="alert alert-warning mt-2" role="alert">
            In case of issues, you can try another method.
            <button className='btn btn-outline-primary btn-sm mt-2 w-100' onClick={getDeviceCodeFromGitHub}>
              Use another method
            </button>
          </div>
        </div>
        }
      </>}
      {gitHubResponse && !authorized &&
        <div className="pt-2">

          Step 1: Copy this code:
          <div className="input-group text-secondary mb-0 h6">
            <input disabled type="text" className="form-control" value={gitHubResponse.user_code} />
            <div className="input-group-append">
              <CopyToClipboard callback={() => sendToMatomo(gitMatomoEventTypes.COPYGITHUBDEVICECODE)} content={gitHubResponse.user_code} data-id='copyToClipboardCopyIcon' className='far fa-copy ml-1 p-2 mt-1' direction={"top"} />
            </div>
          </div>
          <br></br>
          Step 2: Authorize the app here
          <br></br><a target="_blank" href={gitHubResponse.verification_uri}>{gitHubResponse.verification_uri}</a>
          <br /><br></br>
          Step 3: When you are done, click on the button below:
          <button className='btn btn-primary mt-1 w-100' onClick={async () => {
            connectApp()
          }}>Connect</button>
        </div>
      }
      {
        (context.gitHubUser && context.gitHubUser.isConnected) ?
          <div className="pt-2">
            <button data-id='disconnect-github' className='btn btn-primary mt-1 w-100' onClick={async () => {
              disconnect()
            }}>Disconnect</button>
          </div> : null
      }
      {
        (context.gitHubUser && context.gitHubUser.isConnected) ?
          <div className="pt-2">

            <div className="mb-1" data-id={`connected-as-${context.gitHubUser.login}`}>Connected as {context.gitHubUser.login}</div>
            <div className="row">
              {context.gitHubUser.avatar_url ?
                <div className="col-6">
                  <img data-id={`connected-img-${context.gitHubUser.login}`} src={context.gitHubUser.avatar_url} className="w-100" />
                </div> : null}
            </div>
            <div className="row mt-2">
              <div className="col-6">
                {context.gitHubUser.html_url ? <>
                  <label className="text-uppercase">user on github:</label>
                  <a data-id={`connected-link-${context.gitHubUser.login}`} href={context.gitHubUser.html_url}>{context.gitHubUser.html_url}</a> </> : null}
                {context.userEmails && context.userEmails.length > 0 ? <>
                  <label className="text-uppercase mt-2">email:</label>
                  {context.userEmails && context.userEmails.filter((email: any) => email.primary).map((email: any) => {
                    return <span key={email.email}><br></br>{email.email}</span>
                  })}</> : null}
              </div>
            </div>

          </div> : null
      }

    </>)
}
