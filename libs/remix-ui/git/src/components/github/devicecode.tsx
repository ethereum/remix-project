import React, { useEffect } from "react";
import { gitActionsContext, pluginActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import axios from "axios";
import { CopyToClipboard } from "@remix-ui/clipboard";
import { Card } from "react-bootstrap";
import { sendToMatomo } from "../../lib/pluginActions";
import { gitMatomoEventTypes } from "../../types";

export const GetDeviceCode = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const pluginActions = React.useContext(pluginActionsContext)
  const [gitHubResponse, setGitHubResponse] = React.useState<any>(null)
  const [authorized, setAuthorized] = React.useState<boolean>(false)

  const getDeviceCodeFromGitHub = async () => {
    await sendToMatomo(gitMatomoEventTypes.GETGITHUBDEVICECODE)
    setAuthorized(false)
    // Send a POST request
    const response = await axios({
      method: 'post',
      url: 'https://github.remixproject.org/login/device/code',
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
      url: 'https://github.remixproject.org/login/oauth/access_token',
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
        <button className='btn btn-secondary mt-1 w-100' onClick={async () => {
          await getDeviceCodeFromGitHub()
        }}><i className="fab fa-github mr-1"></i>Login with GitHub</button></>
      }
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
