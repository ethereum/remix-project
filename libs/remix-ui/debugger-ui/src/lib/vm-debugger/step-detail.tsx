import React, { useState, useEffect } from 'react'
import DropdownPanel from './dropdown-panel'

export interface StepDetailProps {
    stepDetail: {
        key: string,
        value: string,
        reset: boolean
    }
} 

export const StepDetail = (props: StepDetailProps) => {
    const { stepDetail } = props
    const [detail, setDetail] = useState({
        'vm trace step': '-',
        'execution step': '-',
        'add memory': '',
        'gas': '',
        'remaining gas': '-',
        'loaded address': '-'
    })

    useEffect(() => {
        updateField(stepDetail.key, stepDetail.value, stepDetail.reset)
    }, [stepDetail])

    const updateField = (key, value, reset) => {
        if (!key) return

        if (reset) {
            setDetail(() => {
                return {
                    'vm trace step': '-',
                    'execution step': '-',
                    'add memory': '',
                    'gas': '',
                    'remaining gas': '-',
                    'loaded address': '-'
                }
            })
        } else {
            setDetail(prevDetail => {
                return {
                    ...prevDetail,
                    [key]: value
                }
            })
        }
    }

    return (
        <div id='stepdetail' data-id="stepdetail">
            <DropdownPanel dropdownName='Step details' calldata={ detail } />
        </div>
    )
}

export default StepDetail