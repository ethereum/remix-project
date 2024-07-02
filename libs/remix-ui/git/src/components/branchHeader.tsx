import React, { useEffect, useState } from 'react'
import { gitActionsContext, pluginActionsContext } from '../state/context'
import { ReadCommitResult } from "isomorphic-git"
import { gitPluginContext } from './gitui'
export const BranchHeader = () => {

  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const pluginActions = React.useContext(pluginActionsContext)
  const [changed, setChanged] = useState(false)
  const [isDetached, setIsDetached] = useState(false)
  const [latestCommit, setLatestCommit] = useState<ReadCommitResult>(null)

  useEffect(() => {
    if (context.currentBranch) {
      actions.getBranchDifferences(context.currentBranch, null, context)
    }
    if (!context.currentBranch || (context.currentBranch && context.currentBranch.name === '')) {
      if (context.currentHead === '') {
        setIsDetached(false)
      } else {
        setIsDetached(true)
      }
    } else {
      setIsDetached(false)
    }
    setLatestCommit(null)
    if (context.currentHead !== '') {
      if (context.commits && context.commits.length > 0) {
        const commit = context.commits.find(commit => commit.oid === context.currentHead)
        if (commit) {
          setLatestCommit(commit)
        }
      }
    }
  }, [context.currentBranch, context.commits, context.branches, context.remotes, context.currentHead])

  useEffect(() => {
    if (context.fileStatusResult) {
      const total = context.allchangesnotstaged.length
      const badges = total + context.staged.length
      setChanged((context.deleted.length > 0 || context.staged.length > 0 || context.untracked.length > 0 || context.modified.length > 0))
    }
  }, [context.fileStatusResult, context.modified, context.allchangesnotstaged, context.untracked, context.deleted])

  const showDetachedWarningText = async () => {
    await pluginActions.showAlert({
      message: `You are in 'detached HEAD' state. This means you are not on a branch because you checkout a tag or a specific commit. If you want to commit changes, you will need to create a new branch.`,
      title: 'Warning'
    })
  }

  return (<>
    <div className='text-sm w-100'>
      <div className='text-secondary long-and-truncated'>
        <i className="fa fa-code-branch mr-1 pl-2"></i>
        {changed ? '*' : ''}{context.currentBranch && context.currentBranch.name}
      </div>
      {latestCommit ?
        <div className='text-secondary long-and-truncated'>
          {latestCommit.commit && latestCommit.commit.message ? latestCommit.commit.message : ''}
        </div> : null}
      {isDetached ?
        <div className='text-warning long-and-truncated'>
          You are in a detached state<i onClick={showDetachedWarningText} className="btn fa fa-info-circle mr-1 pl-2"></i>
        </div> : null}
    </div>
    <hr></hr>
  </>)
}