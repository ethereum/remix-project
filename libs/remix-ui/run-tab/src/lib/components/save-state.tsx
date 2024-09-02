// eslint-disable-next-line no-use-before-define
import React from 'react'
import { SaveStateUIProps } from '../types'

export function SaveStateUI(props: SaveStateUIProps) {
  return (
    <div>
      <button className="btn btn-primary" onClick={() => props.saveVMState()}>Save VM state</button>
    </div>
  )
}