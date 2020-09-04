import React, { useState, useRef, useEffect } from 'react'
import AssemblyItems from './assembly-items'
/* eslint-disable-next-line */
import { TreeView, TreeViewItem } from '../../../../tree-view/src/index'
import useExtractData from '../../hooks/extract-data'
import { ExtractData, ExtractFunc, DropdownPanelProps } from '../../types'


import './styles/dropdown-panel.css'
import EventManager from '../../../../../apps/remix-ide/src/lib/events'
import copyToClipboard from '../../../../../apps/remix-ide/src/app/ui/copy-to-clipboard'

export const DropdownPanel = (props: DropdownPanelProps) => {
    const { dropdownName, opts, codeView, index, calldata, header, extractFunc } = props
    const data = useExtractData(calldata, extractFunc)
    const event = new EventManager()
    const dropdownRawEl = useRef(null)
    const [state, setState] = useState({
        header: '',
        json: opts.json,
        displayContentOnly: opts.displayContentOnly,
        toggleDropdown: false,
        message: {
            innerText: '',
            display: 'none'
        },
        dropdownContent: {
            innerText: '',
            display: 'none'
        },
        dropdownRawContent: {
            innerText: '',
            display: 'none'
        },
        title: {
            innerText: '',
            display: 'none'
        },
        showRefreshIcon: false
    })

    useEffect(() => {
        update(calldata, header)
    }, [calldata, header])

    const handleToggle = () => {
        setState(prevState => {
            if (prevState.toggleDropdown) event.trigger('hide', [])
            else event.trigger('show', [])
            return {
                ...prevState,
                toggleDropdown: !prevState.toggleDropdown
            }
        })
    }

    const copyClipboard = () => {
        return dropdownRawEl.current.innerText ? dropdownRawEl.current.innerText : dropdownRawEl.current.textContent
    }

    const message = (message) => {
        setState(state => {
            return {
                ...state,
                message: {
                    innerText: message,
                    display: message ? 'block' : ''
                },
                dropdownRawContent: {
                    ...state.dropdownRawContent,
                    display: 'none'
                },
                dropdownContent: {
                    ...state.dropdownContent,
                    display: 'none'
                },
                showRefreshIcon: false
            }
        })
    }

    const setLoading = () => {
        setState(prevState => {
            return {
                ...prevState,
                message: {
                    innerText: '',
                    display: 'none'
                },
                dropdownRawContent: {
                    ...prevState.dropdownRawContent,
                    display: 'none'
                },
                dropdownContent: {
                    ...prevState.dropdownContent,
                    display: 'none'
                },
                showRefreshIcon: true
            }
        })
    }

    const update = function (calldata, header) {
        setState(prevState => {
            return {
                ...prevState,
                showRefreshIcon: false,
                dropdownContent: {
                    ...prevState.dropdownContent,
                    display: 'none'
                },
                dropdownRawContent: {
                    innerText: JSON.stringify(calldata, null, '\t'),
                    display: 'block'
                }
            }
        })
        if (!this.displayContentOnly) {
        //   this.view.querySelector('.title i.fa-copy').style.display = 'block'
            setState(prevState => {
                return {
                    ...prevState,
                    title: {
                        innerText: header || '',
                        display: 'block'
                    }
                }
            })
        }
        message('')
    }

    const hide = () => {
        setState(prevState => {
            return {
                ...prevState,
                toggleDropdown: false
            }
        })
        event.trigger('hide', [])
    } 
      
    const show = () => {
        setState(prevState => {
            return {
                ...prevState,
                toggleDropdown: true
            }
        })
        event.trigger('show', [])
    }

    let content = <div>Empty</div>
    if (state.json) {
        content = treeView.render({}, null)
    }
    const title = !state.displayContentOnly ? 
    <div className="py-0 px-1 title">
        <div className={state.toggleDropdown ? 'icon fas fa-caret-down' : 'icon fas fa-caret-right'} onClick={handleToggle}></div>
        <div className="name" onClick={handleToggle}>{dropdownName}</div><span className="nameDetail" onClick={handleToggle}></span>
        {copyToClipboard(() => copyClipboard())}
    </div> : <div></div>
    
    if (state.displayContentOnly) {
        setState(prevState => {
            return {
                ...prevState,
                toggleDropdown: true
            }
        })
    }

    return (
        <div className="border rounded px-1 mt-1 bg-light">
            { title }
            <div className='dropdownpanel' style={{ display: state.toggleDropdown ? 'block' : 'none' }}>
                <i className="refresh fas fa-sync" style={{ display: state.showRefreshIcon ? 'inline-block' : 'none' }} aria-hidden="true"></i>
                <div className='dropdowncontent' style={{ display: state.dropdownContent.display }}>
                    { codeView ? <AssemblyItems codeView={codeView} index={index} /> : content }
                </div>
                <div className='dropdownrawcontent' style={{ display: state.dropdownRawContent.display }} ref={ dropdownRawEl }></div>
                <div className='message' style={{ display: state.message.display }}></div>
            </div>
        </div>
    )
}

export default DropdownPanel