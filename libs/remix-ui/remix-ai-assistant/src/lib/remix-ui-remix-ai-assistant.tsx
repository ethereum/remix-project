import React from 'react'
import '../css/remix-ai-assistant.css'
export interface RemixUiRemixAiAssistantProps {
  makePluginCall(pluginName: string, methodName: string, payload: any): Promise<any>
}

export function RemixUiRemixAiAssistant(props: any) {
  return (
    <div className="d-flex flex-column px-3 overflow-hidden">
      <section className="d-flex flex-column justify-content-center align-items-center align-self-center flex-grow-1 ai-assistant-top-height">
        <h5>Remix AI Assistant</h5>
        <p className="ai-assistant-text">The Web3 Ai Assistant helps you by providing personalized recommendations, answering queries about blockchain technology, and assisting with writing smart contracts.</p>
        <div className="mb-3 w-100">
          <button className="btn btn-secondary btn-block">
            <div className="d-flex flex-row justify-content-start align-items-center">
              <span className="fas fa-user-robot-xmarks"></span>
              <span className="ml-2">Ask to explain a contract</span>
            </div>
          </button>
          <button className="btn btn-secondary btn-block">
            <div className="d-flex flex-row justify-content-start align-items-center">
              <span className="fas fa-user-robot-xmarks"></span>
              <span className="ml-2">Ask to explain a function</span>
            </div>
          </button>
          <button className="btn btn-secondary btn-block">
            <div className="d-flex flex-row justify-content-start align-items-center">
              <span className="fas fa-user-robot-xmarks"></span>
              <span className="ml-2">Ask to solve an error</span>
            </div>
          </button>
        </div>
        <p>
          <a href="#" className="text-primary ai-assistant-text">Discover all functionalities</a>
        </p>
      </section>
      <section className="w-100 mt-auto ai-assistant-bottom-height d-flex flex-column align-items-end">
        <div className="bg-light d-flex flex-column w-100 p-3">
          <div>
            <button className="btn bg-dark btn-sm text-secondary">{"@ Add context"}</button>
          </div>
          <div className="mb-3">
            <input type="text" className="form-control bg-light" placeholder="Ask me anything, use @ to mention a file" />
          </div>
          <div id="context-holder" className="d-flex flex-row text-white justify-content-start align-items-center flex-wrap text-success">
            <span className="bg-info p-1 rounded">file1.sol <i className="fas fa-times"></i></span>
            <span className="bg-info p-1 rounded ml-2">file2.sol <i className="fas fa-times"></i></span>
            <span className="bg-info p-1 rounded ml-2">file3.sol <i className="fas fa-times"></i></span>
          </div>
        </div>
      </section>
    </div>
  )
}