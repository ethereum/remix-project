import React, { useState, useRef, useEffect, useReducer } from 'react'
import { initialState, reducer } from '../../reducers/assembly-items'
import './styles/assembly-items.css'

export const AssemblyItems = ({ registerEvent }) => {
  const [assemblyItems, dispatch] = useReducer(reducer, initialState)
  const [selectedItem, setSelectedItem] = useState(0)
  const refs = useRef({})
  const asmItemsRef = useRef(null)

  useEffect(() => {
    registerEvent && registerEvent('codeManagerChanged', (code, address, index) => {
      dispatch({ type: 'FETCH_OPCODES_SUCCESS', payload: { code, address, index } })
    })
  }, [])

  useEffect(() => {
    if (selectedItem !== assemblyItems.index) {
      indexChanged(assemblyItems.index)
    }
  }, [assemblyItems.index])

  const indexChanged = (index: number) => {
    if (index < 0) return
    let currentItem = refs.current[selectedItem] ? refs.current[selectedItem] : null

    if (currentItem) {
      currentItem.removeAttribute('selected')
      currentItem.removeAttribute('style')
      if (currentItem.firstChild) {
        currentItem.firstChild.removeAttribute('style')
      }
      const codeView = asmItemsRef.current

      currentItem = codeView.children[index]
      currentItem.style.setProperty('border-color', 'var(--primary)')
      currentItem.style.setProperty('border-style', 'solid')
      currentItem.setAttribute('selected', 'selected')
      codeView.scrollTop = currentItem.offsetTop - parseInt(codeView.offsetTop)
      setSelectedItem(index)
    }
  }

  return (
    <div className="border rounded px-1 mt-1 bg-light">
      <div className='dropdownpanel'>
        <div className='dropdowncontent'>
          <div className="pl-2 my-1 small instructions" id='asmitems' ref={asmItemsRef}>
            {
              assemblyItems.display.map((item, i) => {
                return <div className="px-1" key={i} ref={ref => refs.current[i] = ref}><span>{item}</span></div>
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssemblyItems
