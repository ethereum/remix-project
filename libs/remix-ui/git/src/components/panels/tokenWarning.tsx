import { gitPluginContext } from "../gitui"
import React, { useEffect, useState } from "react"

export interface TokenWarningProps {
  plugin: any
}

export const TokenWarning = (props: TokenWarningProps) => {
  const context = React.useContext(gitPluginContext)
  return (<>
    {(context.gitHubUser && context.gitHubUser.login) ? null :
      <span className="text-warning text-left">
        <span>Generate and add a Git token to use this plugin. Tokens are added in </span><span className=" text-decoration-line-through messageTip" onClick={async () => {
          await props.plugin.call('menuicons', 'select', 'settings')
        }}>settings</span><span> of the IDE.</span>
      </span>
    }
  </>
  )
}
