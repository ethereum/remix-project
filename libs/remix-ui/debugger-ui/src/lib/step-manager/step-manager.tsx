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
    stepManager && stepManager.event.register('revertWarning', setRevertWarning)
    stepManager && stepManager.event.register('stepChanged', updateStep)
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

  return (
    <div className="py-1">
      <Slider stepManager={stepManager} sliderValue={sliderValue} />
      <ButtonNavigator stepManager={stepManager} revertedReason={revertWarning} stepState={stepState} jumpOutDisabled={jumpOutDisabled} />
    </div>
  )
}

export default StepManager
