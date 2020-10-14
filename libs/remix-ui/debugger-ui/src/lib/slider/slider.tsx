import React, { useState, useEffect } from 'react'

export const Slider = ({ stepManager, sliderValue }) => {
  const [state, setState] = useState({
    currentValue: ''
  })

  useEffect(() => {
    console.log('perfomanceCheck <=> sliderValue')
    setValue(sliderValue)
  }, [sliderValue])

  const setValue = (value) => {
    if (value === state.currentValue) return
    setState(prevState => {
      return { ...prevState, currentValue: value }
    })
    stepManager && stepManager.jumpTo(value)
  }

  const handleChange = (e) => {
    const value = parseInt(e.target.value)

    setValue(value)
  }

  return (
    <div>
        <input id='slider'
            data-id="slider"
            className='w-100 my-0'
            type='range'
            min={0}
            max={stepManager ? stepManager.traceLength - 1 : 0}
            value={state.currentValue}
            onChange={handleChange}
            disabled={stepManager ? stepManager.traceLength === 0 : true}
        />
    </div>
  )
}

export default Slider
