import React, { useState, useRef, useEffect } from 'react'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import { DropdownPanelProps, ExtractData, ExtractFunc } from '../../types'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { default as deepequal } from 'deep-equal'
import './styles/dropdown-panel.css'

export const DropdownPanel = (props: DropdownPanelProps) => {
    const { dropdownName, dropdownMessage, calldata, header, loading, extractFunc, formatSelfFunc } = props
    const extractDataDefault: ExtractFunc = (item, parent?) => {
        const ret: ExtractData = {}

        if (item instanceof Array) {
            ret.children = item.map((item, index) => {
            return {key: index, value: item}
            })
            ret.self = 'Array'
            ret.isNode = true
            ret.isLeaf = false
        } else if (item instanceof Object) {
            ret.children = Object.keys(item).map((key) => {
                return {key: key, value: item[key]}
            })
            ret.self = 'Object'
            ret.isNode = true
            ret.isLeaf = false
        } else {
            ret.self = item
            ret.children = null
            ret.isNode = false
            ret.isLeaf = true
        }
        return ret
    }
    const formatSelfDefault = (key: string | number, data: ExtractData) => {
        return (
            <div className="d-flex mb-1 flex-row label_item">
                <label className="small font-weight-bold pr-1 label_key">{key}:</label> 
                <label className="m-0 label_value">{data.self}</label>
            </div>
        )
    }
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
        updating: false,
        data: null
    })

    useEffect(() => {
        if (!deepequal(state.data, calldata)) update(calldata)
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
                toggleDropdown: !isEmpty,
                data: calldata
            }
        })
    }

    const renderData = (item: ExtractData, parent, key: string | number, keyPath: string) => {
        const data = extractFunc ? extractFunc(item, parent) : extractDataDefault(item, parent)
        const children = (data.children || []).map((child) => {
            return (
                renderData(child.value, data, child.key, keyPath + '/' + child.key)
            )
        })

        if (children && children.length > 0 ) {
            return (
                <TreeViewItem id={`treeViewItem${key}`} key={keyPath} label={ formatSelfFunc ? formatSelfFunc(key, data) : formatSelfDefault(key, data) }>
                    <TreeView id={`treeView${key}`} key={keyPath}>
                        { children }
                    </TreeView>
                </TreeViewItem>
            )
        } else {
            return <TreeViewItem id={key.toString()} key={keyPath} label={ formatSelfFunc ? formatSelfFunc(key, data) : formatSelfDefault(key, data) } />
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
                    {
                        state.data &&
                        <TreeView id="treeView">
                            {
                                Object.keys(state.data).map((innerkey) => renderData(state.data[innerkey], state.data, innerkey, innerkey))
                            }
                        </TreeView>
                    }
                </div>
                <div className='message' style={{ display: state.message.display }}>{ state.message.innerText }</div>
            </div>
        </div>
    )
}

export default DropdownPanel