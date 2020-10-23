import React, { useState, useEffect } from 'react'
import AssemblyItems from './assembly-items'

export const CodeListView = ({ registerEvent }) => {
  const [state, setState] = useState({
    code: [],
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
      <AssemblyItems registerEvent={registerEvent} />
    </div>
  )
}

export default CodeListView
