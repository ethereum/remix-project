import React, { useEffect } from "react";
import { gitActionsContext, pluginActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import axios from "axios";
import { CopyToClipboard } from "@remix-ui/clipboard";
import { Card } from "react-bootstrap";

export const GetDeviceCode = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const pluginActions = React.useContext(pluginActionsContext)
  const [gitHubResponse, setGitHubResponse] = React.useState<any>(null)
  const [authorized, setAuthorized] = React.useState<boolean>(false)

  const getDeviceCodeFromGitHub = async () => {

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

    if (response.error) {

    }

    if (response.access_token) {
      setAuthorized(true)
      await pluginActions.saveToken(response.access_token)
      await actions.loadGitHubUserFromToken()
    }

  }

  const disconnect = async () => {
    setAuthorized(false)
    setGitHubResponse(null)
    await pluginActions.saveToken(null)
    await actions.loadGitHubUserFromToken()
  }

  return (
    <>
      {(context.gitHubUser && context.gitHubUser.login) ? null :
        <button className='btn btn-primary mt-1 w-100' onClick={async () => {
          getDeviceCodeFromGitHub();
        }}><i className="fab fa-github mr-1"></i>Login in with github</button>
      }
      {gitHubResponse && !authorized &&
        <div className="pt-2">

          Step 1: Copy this code:
          <div className="input-group text-secondary mb-0 h6">
            <input disabled type="text" className="form-control" value={gitHubResponse.user_code} />
            <div className="input-group-append">
              <CopyToClipboard content={gitHubResponse.user_code} data-id='copyToClipboardCopyIcon' className='far fa-copy ml-1 p-2 mt-1' direction={"top"} />
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
        (context.gitHubUser && context.gitHubUser.login) ?
          <div className="pt-2">
            <button className='btn btn-primary mt-1 w-100' onClick={async () => {
              disconnect()
            }}>Disconnect</button>
          </div> : null
      }
      {
        (context.gitHubUser && context.gitHubUser.login) ?
          <div className="pt-2">
            <Card>
              <Card.Body>
                <Card.Title data-id={`connected-as-${context.gitHubUser.login}`}>Connected as {context.gitHubUser.login}</Card.Title>
                <Card.Text>
                  <img data-id={`connected-img-${context.gitHubUser.login}`} src={context.gitHubUser.avatar_url} className="w-100" />
                  <a data-id={`connected-link-${context.gitHubUser.login}`} href={context.gitHubUser.html_url}>{context.gitHubUser.html_url}</a>
                  {context.userEmails && context.userEmails.filter((email: any) => email.primary).map((email: any) => {
                    return <span key={email.email}><br></br>{email.email}</span>
                  })}
                </Card.Text>
              </Card.Body>
            </Card>

          </div> : null
      }

    </>)
}