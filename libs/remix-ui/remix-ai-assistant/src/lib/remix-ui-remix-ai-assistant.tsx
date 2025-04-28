import React from 'react'
import '../css/remix-ai-assistant.css'
import PromptZone from '../components/promptzone'
import ResponseZone from '../components/Responsezone'
export interface RemixUiRemixAiAssistantProps {
  makePluginCall(pluginName: string, methodName: string, payload: any): Promise<any>
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
}

export function RemixUiRemixAiAssistant(props: any) {
  return (
    <div className="d-flex flex-column px-3 overflow-hidden">
      <section className="d-flex flex-column justify-content-center align-items-center align-self-center flex-grow-1 ai-assistant-top-height">
        <ResponseZone />
      </section>
      <PromptZone />
    </div>
  )
}