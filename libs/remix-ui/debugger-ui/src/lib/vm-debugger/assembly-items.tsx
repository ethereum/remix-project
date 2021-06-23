import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import { initialState, reducer } from '../../reducers/assembly-items'
import './styles/assembly-items.css'

export const AssemblyItems = ({ registerEvent }) => {
  const [assemblyItems, dispatch] = useReducer(reducer, initialState)
  const [absoluteSelectedIndex, setAbsoluteSelectedIndex] = useState(0)
  const [selectedItem, setSelectedItem] = useState(0)
  const [nextSelectedItem, setNextSelectedItem] = useState(1)
  const refs = useRef({})
  const asmItemsRef = useRef(null)

  useEffect(() => {
    registerEvent && registerEvent('codeManagerChanged', (code, address, index, nextIndex) => {
      dispatch({ type: 'FETCH_OPCODES_SUCCESS', payload: { code, address, index, nextIndex } })
    })
  }, [])

  useEffect(() => {
    console.log('useEffect', assemblyItems.index)
    if (absoluteSelectedIndex !== assemblyItems.index) {
      clearItems()
      indexChanged(assemblyItems.index)
      nextIndexChanged(assemblyItems.nextIndex)
    }
  }, [assemblyItems.opCodes.index])

  const clearItems = () => {
    let currentItem = refs.current[selectedItem] ? refs.current[selectedItem] : null

    if (currentItem) {
      currentItem.removeAttribute('selected')
      currentItem.removeAttribute('style')
      if (currentItem.firstChild) {
        currentItem.firstChild.removeAttribute('style')
      }
    }

    currentItem = refs.current[nextSelectedItem] ? refs.current[nextSelectedItem] : null

    if (currentItem) {
      currentItem.removeAttribute('selected')
      currentItem.removeAttribute('style')
      if (currentItem.firstChild) {
        currentItem.firstChild.removeAttribute('style')
      }
    }
  }

  const indexChanged = (index: number) => {
    console.log("index " + index)
    if (index < 0) return
    
    const codeView = asmItemsRef.current

    const currentItem = codeView.children[index]
    if (currentItem) {
      currentItem.style.setProperty('border-color', 'var(--primary)')
      currentItem.style.setProperty('border-style', 'solid')
      currentItem.setAttribute('selected', 'selected')
      codeView.scrollTop = currentItem.offsetTop - parseInt(codeView.offsetTop)
    }
    
    setSelectedItem(index)
    setAbsoluteSelectedIndex(assemblyItems.opCodes.index)
  }

  const nextIndexChanged = (index: number) => {
    if (index < 0) return
    
    const codeView = asmItemsRef.current

    const currentItem = codeView.children[index]
    if (currentItem) {
      currentItem.style.setProperty('border-color', 'var(--secondary)')
      currentItem.style.setProperty('border-style', 'dotted')
      currentItem.setAttribute('selected', 'selected')      
    }
    setNextSelectedItem(index)
  }

  return (
    <div className="border rounded px-1 mt-1 bg-light">
      <div className='dropdownpanel'>
        <div className='dropdowncontent'>
          <div className="pl-2 my-1 small instructions" id='asmitems' ref={asmItemsRef}>
            {
              assemblyItems.display.map((item, i) => {
                return <div className="px-1" key={i} ref={ref => { refs.current[i] = ref }}><span>{item}</span></div>
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssemblyItems
