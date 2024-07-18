import { gitPluginContext } from "../gitui"
import React, { useEffect, useState } from "react"

export const TokenWarning = () => {
  const context = React.useContext(gitPluginContext)
  return (<>
    {(context.gitHubUser && context.gitHubUser.login) ? null :
      <span className="text-warning text-left">
        <span>Generate and add a Git token or login with GitHub. Tokens are added in </span><span className=" text-decoration-line-through messageTip" onClick={async () => {
        }}>settings.</span>
      </span>
    }
  </>
  )
}
