import React, { useState, useEffect } from 'react'
import DropdownPanel from './dropdown-panel'

export interface StepDetailProps {
    resetStep: boolean,
    detail: {
        key: string,
        value: string
    }
} 

export const StepDetail = (props: StepDetailProps) => {
    const { resetStep, detail } = props
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
        reset()
    }, [resetStep])

    useEffect(() => {
        updateField(detail.key, detail.value)
    }, [detail])

    const reset = () => {
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
    }

    const updateField = (key, value) => {
        setState(prevState => {
            const { detail } = prevState

            detail[key] = value
            return {
                detail
            }
        })
    }

    return (
        <div id='stepdetail' data-id="stepdetail">
            <DropdownPanel dropdownName='Step details' opts={{ json: true, displayContentOnly: false }} calldata={ state.detail } />
        </div>
    )
}

export default StepDetail