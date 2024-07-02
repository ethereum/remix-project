import { gitPluginContext } from "../gitui"
import React, { useEffect, useState } from "react";
export const TokenWarning = () => {
  const context = React.useContext(gitPluginContext)
  return (<>
    {(context.gitHubUser && context.gitHubUser.login) ? null :
      <li className="text-warning list-group-item d-flex justify-content-between align-items-center">
        To use add a GitHub token to the settings.</li>
    }
  </>
  )
}