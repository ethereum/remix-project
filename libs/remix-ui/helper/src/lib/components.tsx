import React from 'react'

export const fileChangedToasterMsg = (from: string, path: string) => (
  <div><i className="fas fa-exclamation-triangle text-danger mr-1"></i>
    <span>
      {from}
      <span className="font-weight-bold text-warning">
        is modifying 
      </span>{path}
    </span>
  </div>
)