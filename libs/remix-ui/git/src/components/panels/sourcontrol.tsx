import React, { useEffect, useState } from 'react'
import { gitActionsContext, pluginActionsContext } from '../../state/context'
import { gitPluginContext } from '../gitui'
import { sourceControlGroup } from '../../types'
import { SourceControGroup } from './sourcecontrol/sourcecontrolgroup'

export const SourceControl = () => {
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)
  const pluginactions = React.useContext(pluginActionsContext)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (context.fileStatusResult) {
      const total = context.allchangesnotstaged.length
      const badges = total + context.staged.length
      pluginactions.statusChanged(badges)
      setShow((context.deleted.length > 0 || context.staged.length > 0 || context.untracked.length > 0 || context.modified.length > 0))
    }
  }, [context.fileStatusResult, context.modified, context.allchangesnotstaged, context.untracked, context.deleted])

  function RenderGroups() {
    const groups: sourceControlGroup[] = [{ name: 'Staged', group: context.staged }, { name: 'Changes', group: context.allchangesnotstaged }]
    return (<>
      {
        groups.map((ob: sourceControlGroup, index: number) => {
          return (
            <SourceControGroup key={index} group={ob}></SourceControGroup>
          )
        })
      }

    </>)
  }

  return (
    <>
      {show ?
        <>
          <div className="mb-2">
            <RenderGroups></RenderGroups>
          </div></>
        : <>

        </>}
    </>
  );

}
