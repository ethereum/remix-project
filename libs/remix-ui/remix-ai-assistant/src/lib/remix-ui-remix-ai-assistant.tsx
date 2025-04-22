import React from 'react'

export interface RemixUiRemixAiAssistantProps {
  makePluginCall(pluginName: string, methodName: string, payload: any): Promise<any>
}

export function RemixUiRemixAiAssistant(props: any) {
  return (
    <div>
      Remix AI Assistant rocks!
      <button onClick={async () => await props.makePluginCall('remixaiassistant', 'makePluginCall', { pluginName: 'remixaiassistant', methodName: 'makePluginCall', payload: { pluginName: 'remixaiassistant', methodName: 'makePluginCall', payload: {} } })}
        className="btn btn-info">Make Plugin Call</button>
    </div>
  )
}