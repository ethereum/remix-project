import React, { useState, useCallback, useEffect } from 'react';
import Select from 'react-select';
import { gitActionsContext } from '../../state/context';
import { selectStyles, selectTheme } from '../../types/styles';
import { gitPluginContext } from '../gitui';

interface BranchySelectProps {
  select: (branch: { name: string }) => void;
}

export const BranchSelect = (props: BranchySelectProps) => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [branchOptions, setBranchOptions] = useState<any>([]);

  useEffect(() => {
    if (context.remoteBranches && context.remoteBranches.length > 0) {
      const options = context.remoteBranches
        && context.remoteBranches.length > 0
        && context.remoteBranches.map(branch => {
          return { value: branch.name, label: branch.name }
        })
      setBranchOptions(options)
    } else {
      setBranchOptions(null)
    }
  }, [context.remoteBranches])

  const selectRemoteBranch = async (e: any) => {
    if (!e || !e.value) {
      props.select(null)
      return
    }
    const value = e && e.value
    props.select({ name: value.toString() })
  }

  return (<>{branchOptions && branchOptions.length ?
    <Select
      options={branchOptions}
      className="mt-2"
      id="branch-select"
      onChange={(e: any) => selectRemoteBranch(e)}
      theme={selectTheme}
      styles={selectStyles}
      isClearable={true}
      placeholder="Type to search for a branch..."
    /> : null}
  </>)

}