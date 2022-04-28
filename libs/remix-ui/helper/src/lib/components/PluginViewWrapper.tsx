import React from "react"
import { useEffect, useState } from "react"

interface IPluginViewWrapperProps {
    plugin: any
  }
  
export const PluginViewWrapper = (props: IPluginViewWrapperProps) => {
  
    const [state, setState] = useState<any>(null)
  
    useEffect(() => {
      if(props.plugin.setDispatch){
        props.plugin.setDispatch(setState)
      }
    }, [])
    
    return (
      <>{state? 
        <>{props.plugin.updateComponent(state)}</>
      :<></>
      }</>
    )
  }