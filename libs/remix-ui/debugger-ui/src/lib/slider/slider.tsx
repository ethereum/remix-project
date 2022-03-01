import React, { useState, useEffect, useRef } from 'react' // eslint-disable-line

export const Slider = ({ jumpTo, sliderValue, traceLength }) => {
  const onChangeId = useRef(null)
  const slider = useRef(null)

  useEffect(() => {
    setValue(sliderValue)
  }, [sliderValue])

  const setValue = (value) => {
    if (value === slider.current.value) return
    slider.current.value = value
    if (onChangeId.current) {
      clearTimeout(onChangeId.current)
    }
    ((value) => {
      onChangeId.current = setTimeout(() => {
        jumpTo && jumpTo(value)
      }, 100)
    })(value)
  }

  const handleChange = (e) => {
    setValue(parseInt(e.target.value))
  }

  if (slider.current) slider.current.internal_onmouseup = handleChange

  return (
    <div>
      <input id='slider'
        data-id="slider"
        className='w-100 my-0'
        ref={slider}
        type='range'
        min={0}
        max={traceLength ? traceLength - 1 : 0}
        onMouseUp={handleChange}
        disabled={traceLength ? traceLength === 0 : true}
      />
    </div>
  )
}

export default Slider
