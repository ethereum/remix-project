import React, { useState, useRef, useEffect } from 'react'
import './styles/assembly-items.css'

export const AssemblyItems = ({ codeView, index }) => {
    const [state, setState] = useState({
        selectedItem: null
    })
    const refs = useRef(codeView.map(React.createRef))
    const asmItemsRef = useRef(null)

    useEffect(() => {
        indexChanged(index)
    }, [index])

    const indexChanged = (index) => {
        if (index < 0) return
        const { selectedItem } = state
        let currentItem = refs.current[selectedItem].current
    
        if (selectedItem) {
            currentItem.removeAttribute('selected')
            currentItem.removeAttribute('style')
            if (currentItem.firstChild) {
                currentItem.firstChild.removeAttribute('style')
            }
        }
    
        const codeView = asmItemsRef.current

        currentItem = codeView.children[index]
        currentItem.style.setProperty('border-color', 'var(--primary)')
        currentItem.style.setProperty('border-style', 'solid')
        currentItem.setAttribute('selected', 'selected')
        codeView.scrollTop = currentItem.offsetTop - parseInt(codeView.offsetTop)
        setState(prevState => {
            return {
                ...prevState,
                selectedItem: index
            }
        })
    }

    return (
        <div className="pl-2 my-1 small instructions" id='asmitems' ref={asmItemsRef}>
            { 
                codeView.map((item, i) => {
                    return <div className="px-1" key={i} ref={refs.current[i]}><span>{item}</span></div>
                }) 
            }
        </div>
    )
}

export default AssemblyItems