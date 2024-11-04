import React, { useContext } from 'react'
import '../remix-ai.css'
import { Default, ChatApi } from './Default'
enum AIChatViewState {
  minimized = 0,
  open = 1
}
interface IRemixAITab {
  plugin: any,
  openState: AIChatViewState
}
export const RemixAITab = (props: IRemixAITab) => {

  return (
    <>
      <div id="remixAITab" className="h-100 w-100 px-2 pb-1">
        <div className='h-100'>
          <Default plugin={props.plugin}></Default>
        </div>
      </div>
    </>
  )
}
export { ChatApi }