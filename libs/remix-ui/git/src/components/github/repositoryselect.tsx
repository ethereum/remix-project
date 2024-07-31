import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { gitActionsContext } from '../../state/context';
import { repository } from '@remix-api';
import { gitMatomoEventTypes } from '../../types';
import { selectStyles, selectTheme } from '../../types/styles';
import { gitPluginContext } from '../gitui';
import { sendToMatomo } from '../../lib/pluginActions';

interface RepositorySelectProps {
  select: (repo: repository) => void;
  title: string;
}

const RepositorySelect = (props: RepositorySelectProps) => {
  const [repoOtions, setRepoOptions] = useState<any>([]);
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (context.repositories && context.repositories.length > 0) {
      // map context.repositories to options
      const options = context.repositories && context.repositories.length > 0 && context.repositories.map(repo => {
        return { value: repo.id, label: repo.full_name }
      })

      setRepoOptions(options)
      setShow(options.length > 0)
    } else {
      setRepoOptions(null)
      setShow(false)
    }
    setLoading(false)

  }, [context.repositories])

  const selectRepo = async (e: any) => {
    if (!e || !e.value) {
      props.select(null)
      setSelected(null)
      return
    }
    const value = e && e.value

    const repo = context.repositories.find(repo => {
      return repo.id.toString() === value.toString()
    })

    if (repo) {
      props.select(repo)
      setSelected(repo)
      await actions.remoteBranches(repo.owner.login, repo.name)
    }
  }

  const fetchRepositories = async () => {
    await sendToMatomo(gitMatomoEventTypes.LOADREPOSITORIESFROMGITHUB)
    try {
      setShow(true)
      setLoading(true)
      setRepoOptions([])
      await actions.repositories()
    } catch (e) {
      // do nothing
    }
  };

  return (
    <><button data-id='fetch-repositories' onClick={fetchRepositories} className="w-100 mt-1 btn btn-secondary mb-2">
      <i className="fab fa-github mr-1"></i>{props.title}
    </button>
    {
      show ?
        <>
          <Select
            options={repoOtions}
            className="mt-1"
            id="repository-select"
            onChange={(e: any) => selectRepo(e)}
            theme={selectTheme}
            styles={selectStyles}
            isClearable={true}
            placeholder="Type to search for a repository..."
            isLoading={loading}
          />
          { selected ? null : <label className="text-warning mt-2">Please select a repository</label> }
        </>: null
    }</>
  );
};

export default RepositorySelect;
