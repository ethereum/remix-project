import React, { useState, useEffect } from 'react'
import Slider from '../slider/slider'
import ButtonNavigator from '../button-navigator/button-navigator'

export const StepManager = ({ stepManager }) => {
  const { jumpTo, traceLength, stepOverBack, stepIntoBack, stepIntoForward, stepOverForward, jumpOut, jumpPreviousBreakpoint, jumpNextBreakpoint, jumpToException } = stepManager
  
  if (stepManager) {
    jumpTo.bind(stepManager)
    stepOverBack.bind(stepManager)
    stepIntoBack.bind(stepManager)
    stepIntoForward.bind(stepManager)
    stepOverForward.bind(stepManager)
    jumpOut.bind(stepManager)
    jumpPreviousBreakpoint.bind(stepManager)
    jumpNextBreakpoint.bind(stepManager)
    jumpToException.bind(stepManager)
  }
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

  return (
    <div className="py-1">
      <Slider jumpTo={jumpTo} sliderValue={sliderValue} traceLength={traceLength} />
      <ButtonNavigator 
        stepIntoBack={stepIntoBack}
        stepIntoForward={stepIntoForward}
        stepOverBack={stepOverBack}
        stepOverForward={stepOverForward}
        revertedReason={revertWarning}
        stepState={stepState}
        jumpOutDisabled={jumpOutDisabled}
        jumpOut={jumpOut}
        jumpNextBreakpoint={jumpNextBreakpoint}
        jumpPreviousBreakpoint={jumpPreviousBreakpoint}
        jumpToException={jumpToException}
      />
    </div>
  )
}

export default StepManager
