import React, { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { gitActionsContext } from "../../state/context";
import { repository } from "@remix-api";
import { gitPluginContext } from "../gitui";
import Select from 'react-select'
import { selectStyles, selectTheme } from "../../types/styles"
import { TokenWarning } from "./tokenWarning"
import RepositorySelect from "../github/repositoryselect"

export const RemotesImport = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [repo, setRepo] = useState<repository>(null);
  const [repoOtions, setRepoOptions] = useState<any>([]);
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [remoteName, setRemoteName] = useState('')

  useEffect(() => {
    if (context.repositories && context.repositories.length > 0) {
      // map context.repositories to options
      const options = context.repositories && context.repositories.length > 0 && context.repositories.map(repo => {
        return { value: repo.id, label: repo.full_name }
      })
      setRepoOptions(options)
    } else {
      setRepoOptions(null)
      setShow(false)
    }
    setLoading(false)

  }, [context.repositories])

  const fetchRepositories = async () => {
    try {
      setShow(true)
      setLoading(true)
      setRepoOptions([])
      await actions.repositories()
    } catch (e) {
      // do nothing
    }
  };

  const selectRepo = async (repo: repository) => {
    setRepo(repo)
  }

  const addRemote = async () => {
    try {
      actions.addRemote({
        name: remoteName,
        url: repo.html_url
      })
    } catch (e) {
      // do nothing
    }

  };
  const onRemoteNameChange = (value: string) => {
    setRemoteName(value)
  }

  return (
    <>
      <RepositorySelect title="Load from GitHub" select={selectRepo} />
      <TokenWarning />
      {repo ?
        <input data-id='remote-panel-remotename' placeholder="remote name" name='remotename' onChange={e => onRemoteNameChange(e.target.value)} value={remoteName} className="form-control mb-2 mt-2" type="text" id="remotename" />
        : null}

      {repo && remoteName ?
        <button data-id='remote-panel-addremote' className='btn btn-primary mt-1 w-100' onClick={async () => {
          await addRemote()
        }}>add {remoteName}:{repo.full_name}</button> : null}

      {repo && !remoteName ?
        <label className="text-warning">Please enter a remote name</label> : null}

    </>
  )
}

