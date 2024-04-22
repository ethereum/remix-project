import { clearInstances } from 'libs/remix-ui/run-tab/src/lib/actions/actions';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { OptionsOrGroups, GroupBase } from 'react-select';
import Select from 'react-select/async';
import { gitActionsContext } from '../../state/context';
import { selectStyles, selectTheme } from '../../types/styles';
import { gitPluginContext } from '../gitui';
import { TokenWarning } from '../panels/tokenWarning';

const RepositorySelect = () => {
  const [page, setPage] = useState(1);
  const [repoOtions, setRepoOptions] = useState<any>([]);
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    console.log('context', context.repositories)
    if (context.repositories && context.repositories.length > 0) {
      // map context.repositories to options
      const options = context.repositories && context.repositories.length > 0 && context.repositories.map(repo => {
        return { value: repo.id, label: repo.full_name }
      })
      console.log('options', options)
      setRepoOptions(options)
    } else {
      setRepoOptions(null)
      setShow(false)
    }
    setLoading(false)

  }, [context.repositories])

  useEffect(() => {
    console.log('OTIONS', repoOtions)
  },[repoOtions])

  const selectRepo = async (value: number | string) => {
    // find repo
    console.log('setRepo', value, context.repositories)

    const repo = context.repositories.find(repo => {
      return repo.id.toString() === value.toString()
    })
    console.log('repo', repo)
    if (repo) {
      //setBranchOptions([])
      //setBranch({ name: "" })
      //setRepo(repo)
      await actions.remoteBranches(repo.owner.login, repo.name)
    }
  }

  const fetchRepositories = async () => {
    try {
      setShow(true)
      setLoading(true)
      //setRepoOptions([])
      //setBranchOptions([])
      console.log(await actions.repositories())
    } catch (e) {
      // do nothing
    }
  };

  return (
    <><TokenWarning /><Button onClick={fetchRepositories} className="w-100 mt-1">
      <i className="fab fa-github mr-1"></i>Fetch Repositories from GitHub
    </Button>
      {
        show ?
          <Select
            options={repoOtions}
            className="mt-1"
            onChange={(e: any) => e && selectRepo(e.value)}
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
