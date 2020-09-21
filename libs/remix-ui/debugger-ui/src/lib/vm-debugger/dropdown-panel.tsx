import React, { useState, useRef, useEffect } from 'react'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import useExtractData from '../../hooks/extract-data'
import { DropdownPanelProps, ExtractData } from '../../types'
import { CopyToClipboard } from '@remix-ui/clipboard'


import './styles/dropdown-panel.css'
/* eslint-disable-next-line */
import EventManager from '../../../../../../apps/remix-ide/src/lib/events'

export const DropdownPanel = (props: DropdownPanelProps) => {
    const { dropdownName, dropdownMessage, opts, calldata, header, loading, extractFunc, formatSelfFunc } = props
    const data = useExtractData(calldata, extractFunc)
    const event = new EventManager()
    const dropdownRawEl = useRef(null)
    const [state, setState] = useState({
        header: '',
        json: opts.json,
        toggleDropdown: true,
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
        updating: false
    })

    useEffect(() => {
        update(calldata)
    }, [calldata])

    useEffect(() => {
        message(dropdownMessage)
    }, [dropdownMessage])

    useEffect(() => {
        if (loading && !state.updating) setLoading()
    }, [loading])

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
        if (message === state.message.innerText) return
        setState(prevState => {
            return {
                ...prevState,
                message: {
                    innerText: message,
                    display: message ? 'block' : ''
                },
                updating: false
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
                updating: true
            }
        })
    }

    const update = function (calldata) {
        setState(prevState => {
            return {
                ...prevState,
                dropdownContent: {
                    ...prevState.dropdownContent,
                    display: 'block'
                },
                dropdownRawContent: {
                    innerText: JSON.stringify(calldata, null, '\t'),
                    display: 'block'
                },
                updating: false
            }
        })
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

    const formatSelfDefault = (key: string, data: ExtractData) => {
        return (
            <div className="d-flex mb-1 flex-row label_item">
                <label className="small font-weight-bold pr-1 label_key">{key}:</label> 
                <label className="m-0 label_value">{data.self}</label>
            </div>
        )
    }

    const renderData = (item: ExtractData, key: string) => {
        const children = (item.children || []).map((child, index) => {
            const childKey = key + '/' + child.key

            return (
                <TreeViewItem id={childKey} key={index} label={ formatSelfFunc ? formatSelfFunc(childKey, item) : formatSelfDefault(childKey, item)}>
                    { renderData(child.value, childKey) }
                </TreeViewItem>
            )
        })

        if (children && children.length > 0 ) {
            return (
                <TreeView id={key}>
                    { children }
                </TreeView>
            )
        } else {
            return <TreeViewItem id={key} label={ formatSelfFunc ? formatSelfFunc(key, item) : formatSelfDefault(key, item) } />
        }
    }

    let content: JSX.Element | JSX.Element[] = <div>Empty</div>
    if (state.json) {
        content = (data).map((item, index) => {
            return (
                <TreeView id={item.key} key={index}>
                    { renderData(item.data, item.key) }
                </TreeView>
            )
        })
    }
    const title = <div className="py-0 px-1 title">
        <div className={state.toggleDropdown ? 'icon fas fa-caret-down' : 'icon fas fa-caret-right'} onClick={handleToggle}></div>
<div className="name" onClick={handleToggle}>{dropdownName}</div><span className="nameDetail" onClick={handleToggle}>{ header }</span>
        <CopyToClipboard getContent={copyClipboard} />
    </div>

    return (
        <div className="border rounded px-1 mt-1 bg-light">
            { title }
            <div className='dropdownpanel' style={{ display: state.toggleDropdown ? 'block' : 'none' }}>
                <i className="refresh fas fa-sync" style={{ display: state.updating ? 'inline-block' : 'none' }} aria-hidden="true"></i>
                <div className='dropdowncontent' style={{ display: state.dropdownContent.display }}>
                    { content }
                </div>
                <div className='dropdownrawcontent' style={{ display: state.dropdownRawContent.display }} ref={ dropdownRawEl }></div>
                <div className='message' style={{ display: state.message.display }}>{ state.message.innerText }</div>
            </div>
        </div>
    )
}

export default DropdownPanel