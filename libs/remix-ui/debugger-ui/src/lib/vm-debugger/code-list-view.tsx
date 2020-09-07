import React, { useState, useEffect } from 'react'
import DropdownPanel from './dropdown-panel'
/* eslint-disable-next-line */
import EventManager from '../../../../../../apps/remix-ide/src/lib/events'

export const CodeListView = ({ vmDebuggerLogic, asm }) => {
  const event = new EventManager()
  const [state, setState] = useState({
    code: [],
    address: '',
    itemSelected: null,
    index: null
  })

  useEffect(() => {
    const { code, address, index } = asm

    changed(code, address, index)
  }, [asm])

  const indexChanged = (index) => {
    if(index < 0) return
    setState(prevState => {
      return {
        ...prevState,
        index
      }
    })
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
    indexChanged(index)
  }

  return (
    <div id='asmcodes'>
      <DropdownPanel dropdownName='Instructions' opts={{ json: false, displayContentOnly: true }} codeView={state.code} index={state.index} />
    </div>
  )
}

export default CodeListView
