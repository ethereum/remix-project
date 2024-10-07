import React, { useContext } from 'react'
import '../remix-ai.css'
import { Default } from './Default'

export const RemixAITab = (props) => {

  const plugin = props.plugin
  return (
    <>
      <div id="remixAITab pr-4 px-2 pb-4">
        <Default plugin={plugin}></Default>
      </div>
    </>
  )
}