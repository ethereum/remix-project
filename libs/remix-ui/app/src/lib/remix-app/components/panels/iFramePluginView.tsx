import React, { createRef, useContext, useEffect, useRef, useState } from 'react'
import IframeReactPlugin from '../../plugins/IFrameReactPlugin'

interface IFramePluginViewProps {
    plugin: IframeReactPlugin
}

const IFramePluginView = (props: IFramePluginViewProps) => {
  const ref = useRef()

  useEffect(() => {
    console.log('IFramePluginView', props.plugin)
    props.plugin.addToView()
  }, [])

  const loaded = () => {
    console.log('IFramePluginView loaded')
    console.log(ref.current)
    props.plugin.shake(ref.current)
  }

  return (<iframe onLoad={loaded} ref={ref} src={props.plugin.profile.url} title={props.plugin.name} id={props.plugin.name} seamless={true} sandbox='allow-popups allow-scripts allow-same-origin allow-forms allow-top-navigation'></iframe>)
}

export default IFramePluginView
