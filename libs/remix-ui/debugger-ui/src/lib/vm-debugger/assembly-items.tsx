import React, { useState, useRef, useEffect } from 'react'
import './styles/assembly-items.css'

export const AssemblyItems = ({ codeView, index }) => {
    console.log('codeView: ', codeView)
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
        console.log('selectedItem: ', selectedItem)
        console.log('refs: ', refs)
        console.log('refs.current: ', refs.current)
        let currentItem = refs.current[selectedItem] ? refs.current[selectedItem].current : null
    
        if (currentItem) {
            if (selectedItem) {
                currentItem.removeAttribute('selected')
                currentItem.removeAttribute('style')
                if (currentItem.firstChild) {
                    currentItem.firstChild.removeAttribute('style')
                }
            }
            const codeView = asmItemsRef.current
            console.log('asmItemsRef: ', asmItemsRef)
            console.log('asmItemsRef.current: ', asmItemsRef.current)

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
    }

    return (
        <div className="border rounded px-1 mt-1 bg-light">
            <div className='dropdownpanel'>
                <div className='dropdowncontent'>
                    <div className="pl-2 my-1 small instructions" id='asmitems' ref={asmItemsRef}>
                        { 
                            codeView.map((item, i) => {
                                return <div className="px-1" key={i} ref={refs.current[i]}><span>{item}</span></div>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AssemblyItems