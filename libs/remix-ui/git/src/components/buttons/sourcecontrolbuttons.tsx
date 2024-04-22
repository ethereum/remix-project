import { faArrowDown, faArrowUp, faArrowsUpDown, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CustomTooltip } from "@remix-ui/helper"
import React, { useEffect, useState } from "react"
import { FormattedMessage } from "react-intl"
import { gitActionsContext } from "../../state/context"
import { branch, remote } from "../../types"
import { gitPluginContext } from "../gitui"
import GitUIButton from "./gituibutton"

interface SourceControlButtonsProps {
  remote?: remote,
  branch?: branch
}

export const SourceControlButtons = (props: SourceControlButtonsProps) => {
  const [branch, setBranch] = useState(props.branch)
  const [remote, setRemote] = useState(props.remote)
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const [commitsAhead, setCommitsAhead] = useState([])
  const [commitsBehind, setCommitsBehind] = useState([])


  useEffect(() => {
    console.log('BRANCH DIFF SourceControlButtons', context.branchDifferences, remote, branch)
    setDefaultRemote()
    if (remote && branch && context.branchDifferences && context.branchDifferences[`${remote.remote}/${branch.name}`]) {
      setCommitsAhead(context.branchDifferences[`${remote.remote}/${branch.name}`]?.uniqueHeadCommits)
      setCommitsBehind(context.branchDifferences[`${remote.remote}/${branch.name}`]?.uniqueRemoteCommits)
    }
  }, [context.branchDifferences, branch, remote])


  const setDefaultRemote = () => {
    if (context.remotes.length > 0) {
      // find remote called origin
      const origin = context.remotes.find(remote => remote.remote === 'origin')
      if (origin) {
        setRemote(origin)
      } else {
        setRemote(context.remotes[0])
      }
    }
  }

  useEffect(() => {
    if (!props.branch) {
      setBranch(context.currentBranch)
    }
    if (!props.remote) {
      setRemote(context.defaultRemote)
    }else{
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
    }else{
      setDefaultRemote()
    }
  }, [context.defaultRemote, context.currentBranch])

  useEffect(() => {
    console.log('SC BUTTONS', branch, remote)
  }, [])



  const pull = async () => {
    await actions.pull(remote.remote, branch.name)
  }

  const push = async () => {
    await actions.pull(remote.remote, branch.name)
  }

  const sync = async () => {
    await actions.pull(remote.remote, branch.name)
    await actions.push(remote.remote, branch.name)
  }


  return (<span className='d-flex justify-content-end align-items-center'>
    <CustomTooltip tooltipText={<FormattedMessage id="git.pull" />}>
      <>{commitsBehind.length}<GitUIButton onClick={pull} className='btn btn-sm'><FontAwesomeIcon icon={faArrowDown} className="" /></GitUIButton></>
    </CustomTooltip>
    <CustomTooltip tooltipText={<FormattedMessage id="git.push" />}>
      <>{commitsAhead.length}<GitUIButton onClick={push} className='btn btn-sm'><FontAwesomeIcon icon={faArrowUp} className="" /></GitUIButton></>
    </CustomTooltip>
    <CustomTooltip tooltipText={<FormattedMessage id="git.sync" />}>
      <GitUIButton onClick={sync} className='btn btn-sm'><FontAwesomeIcon icon={faArrowsUpDown} className="" /></GitUIButton>
    </CustomTooltip>
    <CustomTooltip tooltipText={<FormattedMessage id="git.refresh" />}>
      <GitUIButton onClick={async () => { }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowRotateRight} className="" /></GitUIButton>
    </CustomTooltip>
  </span>)
}