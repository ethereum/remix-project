import React, { useState, useEffect } from 'react'
import Slider from '../slider/slider'
import ButtonNavigator from '../button-navigator/button-navigator'

export const StepManager = ({ stepManager }) => {
  const [state, setState] = useState({
    sliderValue: 0,
    revertWarning: '',
    stepState: '',
    jumpOutDisabled: true
  })

  useEffect(() => {
    if (stepManager) {
      stepManager.event.register('revertWarning', setRevertWarning)
      stepManager.event.register('stepChanged', updateStep)
    }
  }, [stepManager])

  const setRevertWarning = (warning) => {
    setState(prevState => {
      return { ...prevState, revertWarning: warning }
    })
  }

  const updateStep = (step, stepState, jumpOutDisabled) => {
    setState(prevState => {
      return { ...prevState, sliderValue: step, stepState, jumpOutDisabled }
    })
  }

  const { sliderValue, revertWarning, stepState, jumpOutDisabled } = state
  const jumpTo = stepManager ? stepManager.jumpTo.bind(stepManager) : null
  const traceLength = stepManager ? stepManager.traceLength : null

  return (
    <div className="py-1">
      <Slider jumpTo={jumpTo} sliderValue={sliderValue} traceLength={traceLength} />
      <ButtonNavigator stepManager={stepManager} revertedReason={revertWarning} stepState={stepState} jumpOutDisabled={jumpOutDisabled} />
    </div>
  )
}

export default StepManager
