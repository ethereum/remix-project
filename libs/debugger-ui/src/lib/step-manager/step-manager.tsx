import React, { useState, useEffect } from 'react'
import './step-manager.css'
import Slider from '../slider/slider'
import ButtonNavigator from '../button-navigator/button-navigator'

export const StepManager = ({ stepManager }) => {
  const [state, setState] = useState({
    sliderLength: null,
    sliderValue: 0,
    revertWarning: '',
    stepState: '',
    jumpOutDisabled: true
  })

  useEffect(() => {
    stepManager.event.register('traceLengthChanged', setSliderLength)
    stepManager.event.register('revertWarning', setRevertWarning)
    stepManager.event.register('stepChanged', updateStep)
  }, [])

  const setSliderLength = (length) => {
    setState(prevState => {
      return {
        ...prevState,
        sliderLength: length
      }
    })
  }

  const setRevertWarning = (warning) => {
    setState(prevState => {
      return {
        ...prevState,
        revertWarning: warning
      }
    })
  }

  const updateStep = (step, stepState, jumpOutDisabled) => {
    setState(prevState => {
      return {
        ...prevState,
        sliderValue: step,
        stepState,
        jumpOutDisabled
      }
    })
  }

  const { sliderLength, sliderValue, revertWarning, stepState, jumpOutDisabled } = state

  return (
    <div className="py-1">
      <Slider stepManager={stepManager} sliderLength={sliderLength} sliderValue={sliderValue} />
      <ButtonNavigator stepManager={stepManager} revertedReason={revertWarning} stepState={stepState} jumpOutDisabled={jumpOutDisabled} />
    </div>
  )
}

export default StepManager
