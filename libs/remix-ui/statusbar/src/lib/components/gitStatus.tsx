import React, { useEffect, useState } from 'react'
import { StatusBarInterface } from '../types'

export interface GitStatusProps {
  plugin: StatusBarInterface
}

export default function GitStatus({ plugin }: GitStatusProps) {

  const [gitBranchName, setGitBranchName] = useState('')

  return (
    <div
      className="d-flex flex-row p-1 text-white justify-content-center align-items-center"
    >
      <span className="fa-regular fa-code-branch ml-1"></span>
      <span className="small mx-1">{`${gitBranchName}`}</span>
      <span className="fa-solid fa-arrows-rotate fa-1"></span>
    </div>
  )
}
