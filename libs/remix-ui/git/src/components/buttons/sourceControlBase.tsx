import { faArrowDown, faArrowUp, faArrowsUpDown, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CustomTooltip } from "@remix-ui/helper"
import { ReadCommitResult } from "isomorphic-git"
import React, { createContext, useEffect, useState } from "react"
import { FormattedMessage } from "react-intl"
import { gitActionsContext } from "../../state/context"
import { branch, remote } from "@remix-api"
import { gitPluginContext } from "../gitui"
import GitUIButton from "./gituibutton"

interface SourceControlButtonsProps {
  remote?: remote,
  branch?: branch,
  children: React.ReactNode
}

export const syncStateContext = createContext<{
  commitsAhead: ReadCommitResult[],
  commitsBehind: ReadCommitResult[]
  branch: branch,
  remote: remote
}>
({ commitsAhead: [], commitsBehind: [], branch: undefined, remote: undefined })

export const SourceControlBase = (props: SourceControlButtonsProps) => {
  const [branch, setBranch] = useState(props.branch)
  const [remote, setRemote] = useState(props.remote)
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [commitsAhead, setCommitsAhead] = useState<ReadCommitResult[]>([])
  const [commitsBehind, setCommitsBehind] = useState<ReadCommitResult[]>([])

  useEffect(() => {

    setDefaultRemote()
    if (remote && branch && context.branchDifferences && context.branchDifferences[`${remote.name}/${branch.name}`]) {
      setCommitsAhead(context.branchDifferences[`${remote.name}/${branch.name}`]?.uniqueHeadCommits)
      setCommitsBehind(context.branchDifferences[`${remote.name}/${branch.name}`]?.uniqueRemoteCommits)
    } else {
      setCommitsAhead([])
      setCommitsBehind([])
    }
  }, [context.branchDifferences, context.currentBranch, branch, remote])

  const setDefaultRemote = () => {
    if (context.defaultRemote) {
      setRemote(context.defaultRemote)
      return
    }
    if (context.remotes.length > 0) {
      // find remote called origin
      const origin = context.remotes.find(remote => remote.name === 'origin')
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
    <syncStateContext.Provider value={{ commitsAhead, commitsBehind, branch, remote }}>
      {props.children}
    </syncStateContext.Provider>
  </>)

}