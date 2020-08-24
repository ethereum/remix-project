import React, { useState, useRef } from 'react'

const Slider = ({ event }) => {
    const [state, setState] = useState({
        max: null,
        disabled: true,
        previousValue: null,
        currentValue: null
    })
    const sliderRef = useRef(null)

    const setSliderLength = (length) => {
        sliderRef.current.setAttribute('max', length - 1)
        setState({
            ...state,
            max: length - 1,
            disabled: (length === 0)
        })
    
        if (state.disabled) {
            sliderRef.current.setAttribute('disabled', true)
        } else {
            sliderRef.current.removeAttribute('disabled')
        }
    
        setValue(0)
    }

    const setValue = (value) => {
        setState({
            ...state,
            currentValue: value
        })
    }

    const handleChange = (e) => {
        const value = parseInt(e.target.value)

        if (value === state.previousValue) return
        setState({
            ...state,
            previousValue: value,
            currentValue: value
        })
        event.trigger('sliderMoved', [value])
    }

    return (
        <div>
            <input id='slider'
                data-id="slider"
                className='w-100 my-0'
                type='range'
                min={0}
                max={state.max}
                value={state.currentValue}
                onChange={handleChange}
                disabled={state.disabled}
                ref={sliderRef}
            />
        </div>
    )
}

export default Slider
