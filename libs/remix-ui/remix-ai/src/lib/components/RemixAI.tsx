import React, { useContext } from 'react'
import '../remix-ai.css'
import { Default, ChatApi } from './Default'

export const RemixAITab = (props) => {

  const plugin = props.plugin
  return (
    <>
      <div id="remixAITab" className="px-2 pb-4">
        <Default plugin={plugin}></Default>
      </div>
    </>
  )
}
export { ChatApi }