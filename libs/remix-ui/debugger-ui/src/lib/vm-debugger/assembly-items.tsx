import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import { initialState, reducer } from '../../reducers/assembly-items'
import './styles/assembly-items.css'

export const AssemblyItems = ({ registerEvent }) => {
  const [assemblyItems, dispatch] = useReducer(reducer, initialState)
  const [absoluteSelectedIndex, setAbsoluteSelectedIndex] = useState(0)
  const [selectedItem, setSelectedItem] = useState(0)
  const [nextSelectedItems, setNextSelectedItems] = useState([1])
  const [returnInstructionIndexes, setReturnInstructionIndexes] = useState([])
  const [outOfGasInstructionIndexes, setOutOfGasInstructionIndexes] = useState([])
  const refs = useRef({})
  const asmItemsRef = useRef(null)

  useEffect(() => {
    registerEvent && registerEvent('codeManagerChanged', (code, address, index, nextIndexes, returnInstructionIndexes, outOfGasInstructionIndexes) => {
      dispatch({ type: 'FETCH_OPCODES_SUCCESS', payload: { code, address, index, nextIndexes, returnInstructionIndexes, outOfGasInstructionIndexes } })
    })
  }, [])

  useEffect(() => {
    if (absoluteSelectedIndex !== assemblyItems.index) {
      clearItems()
      indexChanged(assemblyItems.index)
      nextIndexesChanged(assemblyItems.nextIndexes)
      returnIndexes(assemblyItems.returnInstructionIndexes)
      outOfGasIndexes(assemblyItems.outOfGasInstructionIndexes)
    }
  }, [assemblyItems.opCodes.index])

  const clearItem = (currentItem) => {
    if (currentItem) {
      currentItem.removeAttribute('selected')
      currentItem.removeAttribute('style')
      if (currentItem.firstChild) {
        currentItem.firstChild.removeAttribute('style')
      }
    }
  }

  const clearItems = () => {
    clearItem(refs.current[selectedItem] ? refs.current[selectedItem] : null)
    if (nextSelectedItems) {
      nextSelectedItems.map((index) => {
        clearItem(refs.current[index] ? refs.current[index] : null)
      })
    }

    returnInstructionIndexes.map((index) => {
      if (index < 0) return
      clearItem(refs.current[index] ? refs.current[index] : null)
    })

    outOfGasInstructionIndexes.map((index) => {
      if (index < 0) return
      clearItem(refs.current[index] ? refs.current[index] : null)
    })
  }

  const indexChanged = (index: number) => {
    if (index < 0) return

    const codeView = asmItemsRef.current

    const currentItem = codeView.children[index]
    if (currentItem) {
      currentItem.style.setProperty('background-color', 'var(--primary)')
      currentItem.style.setProperty('color', 'var(--light)')
      currentItem.setAttribute('selected', 'selected')
      codeView.scrollTop = currentItem.offsetTop - parseInt(codeView.offsetTop)
    }

    setSelectedItem(index)
    setAbsoluteSelectedIndex(assemblyItems.opCodes.index)
  }

  const nextIndexesChanged = (indexes: Array<number>) => {
    indexes.map((index) => {
      if (index < 0) return

      const codeView = asmItemsRef.current

      const currentItem = codeView.children[index]
      if (currentItem) {
        currentItem.style.setProperty('color', 'var(--primary)')
        currentItem.style.setProperty('font-weight', 'bold')
        currentItem.setAttribute('selected', 'selected')
      }
    })
    setNextSelectedItems(indexes)
  }

  const returnIndexes = (indexes) => {
    indexes.map((index) => {
      if (index < 0) return

      const codeView = asmItemsRef.current

      const currentItem = codeView.children[index]
      if (currentItem) {
        currentItem.style.setProperty('border-style', 'dotted')
        currentItem.setAttribute('selected', 'selected')
      }
    })
    setReturnInstructionIndexes(indexes)
  }

  const outOfGasIndexes = (indexes) => {
    indexes.map((index) => {
      if (index < 0) return

      const codeView = asmItemsRef.current

      const currentItem = codeView.children[index]
      if (currentItem) {
        currentItem.style.setProperty('border-color', 'var(--danger)')
        currentItem.style.setProperty('border-style', 'dotted')
        currentItem.setAttribute('selected', 'selected')
      }
    })
    setOutOfGasInstructionIndexes(indexes)
  }

  return (
    <div className="border rounded px-1 mt-1 bg-light">
      <div className='dropdownpanel'>
        <div className='dropdowncontent'>
          <div className="pl-2 my-1 small instructions" data-id="asmitems" id='asmitems' ref={asmItemsRef}>
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
