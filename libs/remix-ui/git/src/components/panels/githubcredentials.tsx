import { checkout, clone, ReadCommitResult } from "isomorphic-git";
import React from "react";
import { gitActionsContext } from "../../state/context";
import { gitPluginContext } from "../gitui";
import { CustomTooltip } from "@remix-ui/helper";

import { useIntl, FormattedMessage } from "react-intl";
import { CopyToClipboard } from "@remix-ui/clipboard";
import { FormControl, InputGroup } from "react-bootstrap";


export const GitHubCredentials = () => {
  const context = React.useContext(gitPluginContext)
  const [githubToken, setGithubToken] = React.useState('')
  const [githubUsername, setGithubUsername] = React.useState('')
  const [githubEmail, setGithubEmail] = React.useState('')
  const intl = useIntl()

  const gitAccessTokenLink = 'https://github.com/settings/tokens/new?scopes=gist,repo&description=Remix%20IDE%20Token'

  function handleChangeTokenState(e: string): void {
    throw new Error("Function not implemented.");
  }

  function handleChangeUserNameState(e: string): void {
    throw new Error("Function not implemented.");
  }

  function handleChangeEmailState(e: string): void {
    throw new Error("Function not implemented.");
  }

  function saveGithubToken(): void {
    throw new Error("Function not implemented.");
  }

  function removeToken(): void {
    throw new Error("Function not implemented.");
  }


  return (
    <>
      <div className="input-group text-secondary mb-0 h6">
        <input type="text" className="form-control" name='githubToken' />
        <div className="input-group-append">
          <CopyToClipboard content={''} data-id='copyToClipboardCopyIcon' className='far fa-copy ml-1 p-2 mt-1' direction={"top"} />
        </div>
      </div>
      <input name='githubUsername' onChange={e => handleChangeUserNameState(e.target.value)} value={githubUsername} className="form-control mb-2" placeholder="GitHub username" type="text" id="githubUsername" />
      <input name='githubEmail' onChange={e => handleChangeEmailState(e.target.value)} value={githubEmail} className="form-control mb-1" placeholder="GitHub email" type="text" id="githubEmail" />
      <hr />
    </>
  );
}