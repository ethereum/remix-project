import React, { useContext } from 'react'
import '../remix-ai.css'
import { Default } from './Default'

export const RemixAITab = (props) => {
  const plugin = props.plugin
  return (
    <>
      <div id="remixAITab">
        <Default></Default>
      </div>
    </>
  )
}