import React from 'react'

export default function DefaultResponseContent() {
  return (
    <>
      <h5 className="ai-assistant-text-heading">RemixAI</h5>
      <p className="ai-assistant-text">RemixAI provides you personalized guidance as you build. It can break down concepts, answer questions about blockchain technology and assist you with your smart contracts.</p>
      <div className="mb-3 w-75 d-flex flex-column gap-2 justify-content-center align-items-center">
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
    </>
  )
}