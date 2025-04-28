import React from 'react'

export default function PromptZone() {
  return (
    <section className="w-100 mt-auto ai-assistant-bottom-height d-flex flex-column align-items-end">
      <div className="bg-light d-flex flex-column w-100 p-3">
        <div className="mb-3">
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
  )
}