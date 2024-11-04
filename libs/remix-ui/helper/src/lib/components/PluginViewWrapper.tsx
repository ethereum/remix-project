import { AppContext } from '@remix-ui/app'
import React, { useContext } from 'react'
import { useEffect, useState } from 'react'

interface IPluginViewWrapperProps {
  plugin: any
}

export const PluginViewWrapper = (props: IPluginViewWrapperProps) => {
  const [state, setState] = useState<any>(null)
  const appContext = useContext(AppContext)

  useEffect(() => {
    if (props.plugin.setDispatch) {
      props.plugin.setDispatch(setState)
    }
    if (props.plugin.setAppStateDispatch) {
      props.plugin.setAppStateDispatch(appContext.appStateDispatch)
    }
  }, [])

  return <>{state ? <>{props.plugin.updateComponent(
    {
      ...state,
      ...appContext['appState']
    })}
  </> : <></>}</>
}
