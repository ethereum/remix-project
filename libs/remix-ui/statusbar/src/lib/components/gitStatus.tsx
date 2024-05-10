import React from 'react'

//use placeholder data to show the small section of the statusbar for git
export default function GitStatus() {
  return (
    <div className="d-flex flex-row p-1 text-white justify-content-center align-items-center">
      <span className="fa-regular fa-code-branch ml-1"></span>
      <span className="small mx-1">dev-updates</span>
      <span className="fa-solid fa-arrows-rotate fa-1"></span>
    </div>
  )
}
