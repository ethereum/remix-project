import React, { useState } from 'react'
import './styles/code-list-view.css'
import EventManager from '../../../../../apps/remix-ide/src/lib/events'

export const VmDebugger = ({ vmDebuggerLogic }) => {
  const event = new EventManager()
  const [state, setState] = useState({
    code: '',
    address: '',
    itemSelected: null,
    
  })

  return (
    <div>
      <h1>Welcome to vmDebugger!</h1>
    </div>
  )
}

export default VmDebugger
