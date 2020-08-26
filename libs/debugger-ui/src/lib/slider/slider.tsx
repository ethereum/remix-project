import React, { useState, useEffect } from 'react'

export const Slider = ({ stepManager, sliderLength, sliderValue }) => {
  const [state, setState] = useState({
    max: null,
    disabled: true,
    previousValue: null,
    currentValue: null
  })

  useEffect(() => {
    setState(prevState => {
      return {
        ...prevState,
        max: sliderLength - 1,
        disabled: (sliderLength === 0)
      }
    })

    setValue(0)
  }, [sliderLength])

  useEffect(() => {
    setValue(sliderValue)
  }, [sliderValue])

  const setValue = (value) => {
    setState(prevState => {
      return {
        ...prevState,
        currentValue: value
      }
    })
  }

  const handleChange = (e) => {
    console.log('e.target: ', e.target)
    const value = parseInt(e.target.value)

    if (value === state.previousValue) return
    setState(prevState => {
      return {
        ...prevState,
        previousValue: value,
        currentValue: value
      }
    })
    stepManager.jumpTo(value)
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
        />
    </div>
  )
}

export default Slider
