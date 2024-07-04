import React, { useEffect, useState } from 'react'
import { gitActionsContext, pluginActionsContext } from '../state/context'
import { storageStatus } from '../lib/pluginActions'
import { ReadCommitResult } from "isomorphic-git"
import { gitPluginContext } from './gitui'
export const BranchHeader = () => {

  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const pluginActions = React.useContext(pluginActionsContext)
  const [changed, setChanged] = useState(false)
  const [isDetached, setIsDetached] = useState(false)
  const [latestCommit, setLatestCommit] = useState<ReadCommitResult>(null)
  const [storageStats, setStorageStats] = useState<string>('')

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

  useEffect(() => {
    const run = async () => {
      const stats = await storageStatus()
      setStorageStats(stats)
    }
    run()

    return () => {
      run()
    }
  }, [])

  const getName = () => {
    const url = context.currentBranch?.remote?.url
    if (!url) return
    const regex = /https:\/\/github\.com\/[^/]+\/([^/]+)\.git/
    const match = url.match(regex)
    return match ? match[1] : 'Couldn\'t get repo name!'
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
            <div className="pr-1 m-0">
              <span className="">Repository Name:</span>
              <span className="text-secondary text-truncate overflow-hidden whitespace-nowrap" style={{ width: '15rem' }}>
                <span className={`${ changed ? 'text-danger pl-2' : "pl-2" }`}>
                  {getName() ?? ''}
                </span>
              </span>
            </div>
            <div className="pr-1 m-0">
              <span className="">Branch Name:</span>
              <span className="pl-2 text-secondary text-truncate overflow-hidden whitespace-nowrap">
                <span className={`${ changed ? 'text-danger pl-2' : "pl-2" }`}>
                  <i className="fa fa-code-branch mr-1 pl-2"></i>
                  {context.currentBranch && context.currentBranch.name}
                </span>
              </span>
            </div>
            <div className="d-flex flex-column">
              <span className="d-flex justify-between align-items-center">
                <span className="">Storage : </span>
                <span className="text-secondary text-sm text-truncate overflow-hidden whitespace-nowrap ml-4">
                  {storageStats} MB
                </span>
              </span>
            </div>
            <div className="d-flex flex-row">
              <span className="d-flex justify-between align-items-center">
                <span className="">Messages :</span>
                <span className="pl-2 text-secondary text-truncate overflow-hidden whitespace-nowrap">
                  {latestCommit ?
                    latestCommit.commit && latestCommit.commit.message ? latestCommit.commit.message : '' : null}
                  {isDetached ?
                    <>You are in a detached state<i onClick={showDetachedWarningText} className="btn fa fa-info-circle mr-1 pl-2"></i></>: null}
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
