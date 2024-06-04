import React, { useEffect, useReducer, useState } from 'react'
import { gitActionsContext } from '../state/context'
import { gitPluginContext } from './gitui'
export const BranchHeader = () => {

  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (context.currentBranch) {
      console.log('GET BRANCH COMMITS', context.currentBranch)
      actions.getBranchDifferences(context.currentBranch, null, context)
    }
  }, [context.currentBranch, context.commits, context.branches, context.remotes])

  useEffect(() => {
    if (context.fileStatusResult) {
      const total = context.allchangesnotstaged.length
      const badges = total + context.staged.length
      setChanged((context.deleted.length > 0 || context.staged.length > 0 || context.untracked.length > 0 || context.modified.length > 0))
    }
  }, [context.fileStatusResult, context.modified, context.allchangesnotstaged, context.untracked, context.deleted])

  return (<>
    <div className='text-sm w-100'>
      <div className='text-secondary long-and-truncated'>
        <i className="fa fa-code-branch mr-1 pl-2"></i>
        {changed?'*':''}{context.currentBranch && context.currentBranch.name}</div>
    </div>
    <hr></hr>
  </>)
}