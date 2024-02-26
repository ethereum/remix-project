import React, { useEffect } from "react";
import { gitActionsContext, pluginActionsContext } from "../../state/context";
import { gitPluginContext, loaderContext } from "../gitui";
import axios from "axios";
import { CopyToClipboard } from "@remix-ui/clipboard";
import { Card } from "react-bootstrap";


export const GitHubAuth = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const loader = React.useContext(loaderContext)
  const pluginActions = React.useContext(pluginActionsContext)
  const [gitHubResponse, setGitHubResponse] = React.useState<any>(null)
  const [authorized, setAuthorized] = React.useState<boolean>(false)
  
  useEffect(() => {
    checkConnection()
  }, [context.gitHubAccessToken, loader.plugin])

  const checkConnection = async () => {
    console.log('checkConnection', context.gitHubAccessToken)
    await actions.getGitHubUser()
  }

  useEffect(() => {
    console.log('context.rateLimit', context.rateLimit)
  }, [context.rateLimit])


  return (
    <>
      {(context.gitHubUser && context.gitHubUser.login) ? null :
        <li className="text-warning list-group-item d-flex justify-content-between align-items-center">
        Not connected to GitHub. Add a valid token.</li>
      }
      {
        (context.gitHubUser && context.gitHubUser.login) ?
        <div className="pt-2">
          <Card>
            <Card.Body>
              <Card.Title>Connected as {context.gitHubUser.login}</Card.Title>
              <Card.Text>
                <img src={context.gitHubUser.avatar_url} className="w-100" />
                <a target="_blank" href={context.gitHubUser.html_url}>{context.gitHubUser.html_url}</a>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>: null
      }


    </>)
}