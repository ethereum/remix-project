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

  const getName = () => {
    const url = context.currentBranch?.remote?.url
    if (!url) return
    const regex = /https:\/\/github\.com\/[^/]+\/([^/]+)\.git/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const showDetachedWarningText = async () => {
    await pluginActions.showAlert({
      message: `You are in 'detached HEAD' state. This means you are not on a branch because you checkout a tag or a specific commit. If you want to commit changes, you will need to create a new branch.`,
      title: 'Warning'
    })
  }

  const Heading = () => {
    return (
      <div className="container-fluid px-3">
        <div className="d-flex flex-column pt-1 mb-1">
          <div className="d-flex flex-column justify-content-start align-items-start">
            {getName() ? (
              <div className="pr-1 m-0">
                <span className="col-4 px-0">Repository Name:</span>
                <span className="" style={{ width: '15rem' }}>
                  <span className={`${ changed ? 'text-danger pl-2 text-truncate overflow-hidden whitespace-nowrap ml-4' : "text-secondary pl-2 text-truncate overflow-hidden whitespace-nowrap ml-4" }`}>
                    {getName() ?? ''}
                  </span>
                </span>
              </div>
            ) : null
            }
            <div className="pr-1 m-0">
              <span className="col-4 px-0">Branch Name:</span>
              <span className="pl-2 text-secondary text-truncate overflow-hidden whitespace-nowrap ml-4">
                <span className={`${changed ? 'text-danger pl-2' : "pl-2"}`}>
                  <i className="fa fa-code-branch mr-1 pl-2"></i>
                  {context.currentBranch && context.currentBranch.name}
                </span>
              </span>
            </div>
            {context.storage.enabled ?
              <div className="d-flex">
                <span className="d-flex justify-between align-items-center" style={{ width: '15rem' }}>
                  <span className="col-4 px-0">Storage :</span>
                  <span className="text-secondary text-sm text-truncate overflow-hidden whitespace-nowrap ml-4">
                    {context.storage.used} MB used
                  ({context.storage.percentUsed} %)
                  </span>
                </span>
              </div> : null}
            <div className="d-flex flex-row">
              <span className="d-flex justify-between align-items-center" style={{ width: '15rem' }}>
                <span className="col-4 px-0">Messages :</span>
                <span className="text-truncate overflow-hidden" >
                  <span className="text-secondary text-truncate overflow-hidden whitespace-nowrap ml-4">
                    {latestCommit ?
                      latestCommit.commit && latestCommit.commit.message ? latestCommit.commit.message : '' : null}
                    {isDetached ?
                      <>You are in a detached state<i onClick={showDetachedWarningText} className="btn fa fa-info-circle mr-1 pl-2"></i></>: null}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (<>
    <div className='text-sm w-100'>
      <Heading />
    </div>
    <hr></hr>
  </>)
}
