import React, { useRef, useState } from 'react'
import IframeReactPlugin from '../../plugins/IFrameReactPlugin'

interface IFramePluginViewProps {
    plugin: IframeReactPlugin
}

const IFramePluginView = (props: IFramePluginViewProps) => {
  const ref = useRef()
  const [loading, isLoading] = useState<boolean>(true)

  const loaded = () => {
    console.log(props.plugin.profile.name + "loaded")
    props.plugin.shake(ref.current)
    isLoading(false)
  }

  const loader = <div className='d-flex justify-content-center align-items-center'>
    <div className='spinner-border' role="status">
      <span className='sr-only'>Loading...</span>
    </div>
  </div>

  return (<>
    <div className={loading ? '' : 'd-none'}>{loader}</div>
    <iframe onLoad={loaded} ref={ref} src={props.plugin.profile.url} title={props.plugin.name} id={props.plugin.name} seamless={true} sandbox='allow-popups allow-scripts allow-same-origin allow-forms allow-top-navigation'></iframe>
  </>)
}

export default IFramePluginView
