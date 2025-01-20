
import React, { useState } from "react"
import { Alert, Form, FormControl, InputGroup } from "react-bootstrap"
import { useLocalStorage } from "../../hooks/useLocalStorage"
import { gitActionsContext } from "../../state/context"
import { gitPluginContext } from "../gitui"
import { SelectAndCloneRepositories } from "../github/selectandclonerepositories"
import { RemixUiCheckbox } from "@remix-ui/checkbox"
import GitUIButton from "../buttons/gituibutton"

interface CloneProps {
  hideLoadFromGitHub?: boolean
}

export const Clone = (props: CloneProps) => {
  const { hideLoadFromGitHub } = props
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [cloneUrl, setCloneUrl] = useLocalStorage(
    "CLONE_URL",
    ''
  );

  const [cloneDepth, setCloneDepth] = useLocalStorage(
    "CLONE_DEPTH",
    1
  );

  const [cloneBranch, setCloneBranch] = useLocalStorage(
    "CLONE_BRANCH",
    ''
  );

  const [url, setUrl] = useLocalStorage(
    "GITHUB_URL",
    ''
  );

  const clone = async () => {
    await actions.clone({
      url: cloneUrl,
      branch: cloneBranch,
      depth: cloneDepth,
      singleBranch: !cloneAllBranches
    })
  }

  const onCloneBranchChange = (value: string) => {
    setCloneBranch(value)
  }

  const onGitHubCloneUrlChange = (value: string) => {
    setCloneUrl(value)
  }

  const onDepthChange = (value: number) => {
    setCloneDepth(value)
  }

  const [cloneAllBranches, setcloneAllBranches] = useLocalStorage(
    "GITHUB_CLONE_ALL_BRANCHES",
    false
  );

  const onAllBranchChange = () => {
    setcloneAllBranches((e: any) => !e)
  }

  return (
    <>
      <div data-id="clone-panel-content">
        {!hideLoadFromGitHub ? <>
          <label className="text-uppercase">Clone from GitHub</label>
          <SelectAndCloneRepositories cloneAllBranches={cloneAllBranches} cloneDepth={cloneDepth} />
          <hr /></> : null}
        <label className="text-uppercase">Clone from URL</label>
        <InputGroup className="mb-2">
          <FormControl data-id="clone-url" id="cloneulr" placeholder="url" name='cloneurl' value={cloneUrl} onChange={e => onGitHubCloneUrlChange(e.target.value)} aria-describedby="urlprepend" />
        </InputGroup>

        <input name='clonebranch' data-id="clone-branch" onChange={e => onCloneBranchChange(e.target.value)} value={cloneBranch} className="form-control mb-2 mt-2" placeholder="branch" type="text" id="clonebranch" />
        <GitUIButton disabledCondition={!cloneUrl} data-id='clone-btn' className='btn btn-primary mt-1 w-100' onClick={async () => {
          clone()
        }}>clone</GitUIButton>
        <hr />
        <label className="text-uppercase">Options</label>
        <InputGroup className="mt-1 mb-1">
          <InputGroup.Prepend className="bg-secondary">
            <InputGroup.Text id="clonedepthprepend" className="text-dark">
              --depth
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="clonedepth" type="number" value={cloneDepth} onChange={e => onDepthChange(parseInt(e.target.value))} aria-describedby="clonedepthprepend" />
        </InputGroup>

        <RemixUiCheckbox
          id={`cloneAllBranches`}
          inputType="checkbox"
          name="cloneAllBranches"
          label={`Clone all branches`}
          onClick={() => onAllBranchChange()}
          checked={cloneAllBranches}
          onChange={() => { }}
        />

        <hr></hr>
      </div>
    </>)
}
