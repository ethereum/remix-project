import React, { useState, useEffect } from 'react'
import AssemblyItems from './assembly-items'

export const CodeListView = ({ asm }) => {
  const [state, setState] = useState({
    code: [],
    address: '',
    itemSelected: null,
    index: null
  })

  useEffect(() => {
    console.log('perfomanceCheck <=> changed')
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
      <AssemblyItems codeView={state.code || []} index={state.index} />
    </div>
  )
}

export default CodeListView
