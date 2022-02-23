import React, { useState, useEffect, useRef } from 'react' // eslint-disable-line

export const Slider = ({ jumpTo, sliderValue, traceLength }) => {
  const [state, setState] = useState({
    currentValue: 0
  })

  const onChangeId = useRef(null)

  useEffect(() => {
    setValue(sliderValue)
  }, [sliderValue])

  const setValue = (value) => {
    if (value === state.currentValue) return
    setState(prevState => {
      return { ...prevState, currentValue: value }
    })
    jumpTo && jumpTo(value)
  }

  const handleChange = (e) => {
    if (onChangeId.current) {
      window.clearTimeout(onChangeId.current)
    }
    ((value) => {
      onChangeId.current = setTimeout(() => {
        console.log(value)
        value = parseInt(value)
        setValue(value)
      }, 100)
    })(e.target.value)    
  }

  return (
    <div>
      <input id='slider'
        data-id="slider"
        className='w-100 my-0'
        type='range'
        min={0}
        max={traceLength ? traceLength - 1 : 0}
        value={state.currentValue}
        onChange={handleChange}
        disabled={traceLength ? traceLength === 0 : true}
      />
    </div>
  )
}

export default Slider
