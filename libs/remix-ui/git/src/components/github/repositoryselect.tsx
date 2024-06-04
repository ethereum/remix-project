import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import { gitActionsContext } from '../../state/context';
import { repository } from '../../types';
import { selectStyles, selectTheme } from '../../types/styles';
import { gitPluginContext } from '../gitui';
import { TokenWarning } from '../panels/tokenWarning';

interface RepositorySelectProps {
  select: (repo: repository) => void;
}

const RepositorySelect = (props: RepositorySelectProps) => {
  const [repoOtions, setRepoOptions] = useState<any>([]);
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

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
      return
    }
    const value = e && e.value

    const repo = context.repositories.find(repo => {
      return repo.id.toString() === value.toString()
    })

    if (repo) {
      props.select(repo)
      await actions.remoteBranches(repo.owner.login, repo.name)
    }
  }

  const fetchRepositories = async () => {
    try {
      setShow(true)
      setLoading(true)
      setRepoOptions([])
      console.log(await actions.repositories())
    } catch (e) {
      // do nothing
    }
  };

  return (
    <><Button onClick={fetchRepositories} className="w-100 mt-1">
      <i className="fab fa-github mr-1"></i>Fetch Repositories from GitHub
    </Button>
    {
      show ?
        <Select
          options={repoOtions}
          className="mt-1"
          onChange={(e: any) => selectRepo(e)}
          theme={selectTheme}
          styles={selectStyles}
          isClearable={true}
          placeholder="Type to search for a repository..."
          isLoading={loading}
        /> : null
    }</>
  );
};

export default RepositorySelect;
