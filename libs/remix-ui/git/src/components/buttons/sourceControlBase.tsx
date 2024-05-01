import { faArrowDown, faArrowUp, faArrowsUpDown, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CustomTooltip } from "@remix-ui/helper"
import { ReadCommitResult } from "isomorphic-git"
import React, { createContext, useEffect, useState } from "react"
import { FormattedMessage } from "react-intl"
import { gitActionsContext } from "../../state/context"
import { branch, remote } from "../../types"
import { gitPluginContext } from "../gitui"
import GitUIButton from "./gituibutton"

interface SourceControlButtonsProps {
  remote?: remote,
  branch?: branch,
  children: React.ReactNode
}

export const syncStateContext = createContext<{commitsAhead: ReadCommitResult[], commitsBehind: ReadCommitResult[]}>({commitsAhead: [], commitsBehind: []})

export const SourceControlBase = (props: SourceControlButtonsProps) => {
  const [branch, setBranch] = useState(props.branch)
  const [remote, setRemote] = useState(props.remote)
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [commitsAhead, setCommitsAhead] = useState<ReadCommitResult[]>([])
  const [commitsBehind, setCommitsBehind] = useState<ReadCommitResult[]>([])

  useEffect(() => {
    console.log('BRANCH DIFF SourceControlButtons',branch, remote, context.branchDifferences, context.currentBranch)
    setDefaultRemote()
    if (remote && branch && context.branchDifferences && context.branchDifferences[`${remote.remote}/${branch.name}`]) {
      console.log('BRANCH DIFF found SourceControlButtons', context.branchDifferences[`${remote.remote}/${branch.name}`])
      setCommitsAhead(context.branchDifferences[`${remote.remote}/${branch.name}`]?.uniqueHeadCommits)
      setCommitsBehind(context.branchDifferences[`${remote.remote}/${branch.name}`]?.uniqueRemoteCommits)
    }else{
      setCommitsAhead([])
      setCommitsBehind([])
    }
  }, [context.branchDifferences, context.currentBranch, branch, remote])


  const setDefaultRemote = () => {
  
    if (context.remotes.length > 0) {
      // find remote called origin
      const origin = context.remotes.find(remote => remote.remote === 'origin')
      console.log('DEFAULT REMOTE', origin)
      if (origin) {
        setRemote(origin)
      } else {
        setRemote(context.remotes[0])
      }
      return origin
    }
    return null
  }

  useEffect(() => {
    if (!props.branch) {
      setBranch(context.currentBranch)
    }
    if (!props.remote) {
      setRemote(context.defaultRemote)
    } else {
      setDefaultRemote()
    }
  }, [])

  useEffect(() => {
    console.log('context', context.defaultRemote, context.currentBranch)
    if (!props.branch) {
      setBranch(context.currentBranch)
    }
    if (!props.remote) {
      setRemote(context.defaultRemote)
    } else {
      setDefaultRemote()
    }
  }, [context.defaultRemote, context.currentBranch])

  return (<>
    <syncStateContext.Provider value={{commitsAhead, commitsBehind}}>
      {props.children}
    </syncStateContext.Provider>
  </>)
  
}