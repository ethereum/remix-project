import React from 'react'

export interface TopCardProps {
  title: string
  description: string
  icon: string
  onClick: () => void
  importWorkspace: boolean
}

export function TopCard(props: TopCardProps) {

  return (
    <div
      className={`explora-topcard d-flex flex-row align-items-center bg-light p-4 shadow-sm ${props.importWorkspace ? 'border bg-none' : 'border-0'}`}
      onClick={props.onClick}
      style={{
        borderRadius: '10px'
      }}
    >
      <span className="d-flex flex-shrink-0">
        {props.title.includes('AI') ? <img src={props.icon} style={{ width: '20px', height: '20px' }} /> : <i className={`${props.icon} fa-1x text-light`}></i>}
      </span>
      <span className="d-flex flex-column flex-grow-1 ms-3">
        <p className="mb-0">{props.title}</p>
        <p className="mb-0 fw-light">{props.description}</p>
      </span>
    </div>
  )
}
