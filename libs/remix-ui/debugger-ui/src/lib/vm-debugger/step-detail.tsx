import React, { useState, useEffect } from 'react'
import DropdownPanel from './dropdown-panel'

export interface StepDetailProps {
    detail: {
        key: string,
        value: string,
        reset: boolean
    }
} 

export const StepDetail = (props: StepDetailProps) => {
    const { detail } = props
    const [state, setState] = useState({
        detail: {
            'vm trace step': '-',
            'execution step': '-',
            'add memory': '',
            'gas': '',
            'remaining gas': '-',
            'loaded address': '-'
        }
    })

    useEffect(() => {
        updateField(detail.key, detail.value, detail.reset)
    }, [detail])

    const updateField = (key, value, reset) => {
        if (reset) {
            setState(() => {
                return {
                    detail: {
                        'vm trace step': '-',
                        'execution step': '-',
                        'add memory': '',
                        'gas': '',
                        'remaining gas': '-',
                        'loaded address': '-'
                    }
                }
            })
        } else {
            setState(prevState => {
                const { detail } = prevState
    
                detail[key] = value
                return {
                    detail
                }
            })
        }
    }

    return (
        <div id='stepdetail' data-id="stepdetail">
            <DropdownPanel dropdownName='Step details' opts={{ json: true, displayContentOnly: false }} calldata={ state.detail } />
        </div>
    )
}

export default StepDetail