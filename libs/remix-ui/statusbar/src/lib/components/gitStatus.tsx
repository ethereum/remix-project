import React, { useState } from 'react'

export interface GitStatusProps {
  workspaceName: string
}

export default function GitStatus({ workspaceName }: GitStatusProps) {

  return (
    <div className="d-flex flex-row p-1 text-white justify-content-center align-items-center">
      <span className="fa-regular fa-code-branch ml-1"></span>
      <span className="small mx-1">{`${workspaceName}`}</span>
      <span className="fa-solid fa-arrows-rotate fa-1"></span>
    </div>
  )
}
