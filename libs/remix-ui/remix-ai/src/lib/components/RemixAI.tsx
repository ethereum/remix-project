import React, { useContext } from 'react'
import '../remix-ai.css'
import { Default, ChatApi } from './Default'

interface IRemixAITab {
  plugin: any,
}
export const RemixAITab = (props: IRemixAITab) => {

  return (
    <>
      <div id="remixAITab" className="mx-2 h-100 w-100 px-0">
        <div className='h-100'>
          <Default plugin={props.plugin}></Default>
        </div>
      </div>
    </>
  )
}
export { ChatApi }