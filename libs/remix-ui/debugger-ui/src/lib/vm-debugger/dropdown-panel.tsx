import React, { useState, useRef, useEffect } from 'react'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import useExtractData from '../../hooks/extract-data'
import { DropdownPanelProps, ExtractData } from '../../types'
import { CopyToClipboard } from '@remix-ui/clipboard'


import './styles/dropdown-panel.css'

export const DropdownPanel = (props: DropdownPanelProps) => {
    const { dropdownName, dropdownMessage, calldata, header, loading, extractFunc, formatSelfFunc } = props
    const data = useExtractData(calldata, extractFunc)
    const [state, setState] = useState({
        header: '',
        toggleDropdown: false,
        message: {
            innerText: 'No data available.',
            display: 'block'
        },
        dropdownContent: {
            innerText: '',
            display: 'none'
        },
        title: {
            innerText: '',
            display: 'none'
        },
        copiableContent: '',
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
            return {
                ...prevState,
                toggleDropdown: !prevState.toggleDropdown
            }
        })
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
                dropdownContent: {
                    ...prevState.dropdownContent,
                    display: 'none'
                },
                copiableContent: '',
                updating: true
            }
        })
    }

    const update = function (calldata) {
        let isEmpty = !calldata ? true : false

        if(calldata && Array.isArray(calldata) && calldata.length === 0) isEmpty = true
        else if(calldata && Object.keys(calldata).length === 0 && calldata.constructor === Object) isEmpty = true

        setState(prevState => {
            return {
                ...prevState,
                dropdownContent: {
                    ...prevState.dropdownContent,
                    display: 'block'
                },
                copiableContent: JSON.stringify(calldata, null, '\t'),
                message: {
                    innerText: isEmpty ? 'No data available' : '',
                    display: isEmpty ? 'block' : 'none'
                },
                updating: false,
                toggleDropdown: !isEmpty
            }
        })
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

    const uniquePanelName = dropdownName.split(' ').join('')

    return (
        <div className="border rounded px-1 mt-1 bg-light">
            <div className="py-0 px-1 title">
                <div className={state.toggleDropdown ? 'icon fas fa-caret-down' : 'icon fas fa-caret-right'} onClick={handleToggle}></div>
                <div className="name" data-id={`dropdownPanel${uniquePanelName}`} onClick={handleToggle}>{dropdownName}</div><span className="nameDetail" onClick={handleToggle}>{ header }</span>
                <CopyToClipboard content={state.copiableContent} data-id={`dropdownPanelCopyToClipboard${uniquePanelName}`} />
            </div>
            <div className='dropdownpanel' style={{ display: state.toggleDropdown ? 'block' : 'none' }}>
                <i className="refresh fas fa-sync" style={{ display: state.updating ? 'inline-block' : 'none' }} aria-hidden="true"></i>
                <div className='dropdowncontent' style={{ display: state.dropdownContent.display }}>
                    { data.map((item, index) => {
                        return (
                            <TreeView id={item.key} key={index}>
                                { renderData(item.data, item.key) }
                            </TreeView>
                        )
                    }) }
                </div>
                <div className='message' style={{ display: state.message.display }}>{ state.message.innerText }</div>
            </div>
        </div>
    )
}

export default DropdownPanel