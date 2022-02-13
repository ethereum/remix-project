import React from "react"
import { useEffect, useState } from "react"

interface IViewPluginUI {
    plugin: any
  }
  
export const ViewPluginUI = (props: IViewPluginUI) => {
  
    const [state, setState] = useState<any>(null)
  
    useEffect(() => {
      console.log(props.plugin)
      if(props.plugin.setDispatch){
        props.plugin.setDispatch(setState)
      }
    }, [])
  
    useEffect(() => {
      console.log(state)
    }, [state])
  
    return (
      <>{state? 
        <>{props.plugin.updateComponent(state)}</>
      :<></>
      }</>
    )
  }