import React, { useState, useRef, useEffect } from 'react'
import './styles/assembly-items.css'

export const AssemblyItems = ({ codeView, index }) => {
    const [state, setState] = useState({
        selectedItem: 0,
        opCode: []
    })
    const refs = useRef({})
    const asmItemsRef = useRef(null)

    useEffect(() => {
        indexChanged(index)
    }, [index])

    useEffect(() => {
        opCodeChanged(codeView)
    }, [codeView])

    const indexChanged = (index) => {
        if (index < 0) return
        const { selectedItem } = state
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
            setState(prevState => {
                return {
                    ...prevState,
                    selectedItem: index
                }
            })
        }
    }

    const opCodeChanged = (codeView) => {
        setState(prevState => {
            return {
                ...prevState,
                opCode: codeView
            }
        })
    }

    return (
        <div className="border rounded px-1 mt-1 bg-light">
            <div className='dropdownpanel'>
                <div className='dropdowncontent'>
                    <div className="pl-2 my-1 small instructions" id='asmitems' ref={asmItemsRef}>
                        {
                            // state.opCode.map((item, i) => {
                            //     return <div className="px-1" key={i} ref={ref => refs.current[i] = ref}><span>{item}</span></div>
                            // })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AssemblyItems