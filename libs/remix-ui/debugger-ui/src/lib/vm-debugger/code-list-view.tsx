import React, { useState, useRef } from 'react'
import DropdownPanel from './dropdown-panel'
import EventManager from '../../../../../apps/remix-ide/src/lib/events'

export const CodeListView = ({ vmDebuggerLogic }) => {
  const event = new EventManager()
  const [state, setState] = useState({
    code: '',
    address: '',
    itemSelected: null,
    index: null
  })

  const indexChanged = (index) => {
    if(index < 0) return
    setState(prevState => {
      return {
        ...prevState,
        index
      }
    })
  }

  const reset = () => {
    changed([], '', -1)
  }

  const changed = (code, address, index) => {
    if (state.address === address) {
      return indexChanged(index)
    }
    setState(prevState => {
      return {
        ...prevState,
        code,
        address
      }
    })
    this.basicPanel.setContent(this.renderAssemblyItems())
    indexChanged(index)
  }

  return (
    <div id='asmcodes'>
      <DropdownPanel dropdownName='Instructions' opts={{ json: false, displayContentOnly: true }} codeView={state.code} index={state.index} />
    </div>
  )
}

export default CodeListView
