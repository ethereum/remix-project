import React, { useState, useEffect } from 'react'
import './button-navigator.css'

export const ButtonNavigation = ({ stepManager, revertedReason, stepState, jumpOutDisabled }) => {
  const [state, setState] = useState({
    intoBackDisabled: true,
    overBackDisabled: true,
    intoForwardDisabled: true,
    overForwardDisabled: true,
    jumpOutDisabled: true,
    jumpNextBreakpointDisabled: true,
    jumpPreviousBreakpointDisabled: true
  })

  useEffect(() => {
    stepChanged(stepState, jumpOutDisabled)
  }, [stepState, jumpOutDisabled])

  const reset = () => {
    setState(() => {
      return {
        intoBackDisabled: true,
        overBackDisabled: true,
        intoForwardDisabled: true,
        overForwardDisabled: true,
        jumpOutDisabled: true,
        jumpNextBreakpointDisabled: true,
        jumpPreviousBreakpointDisabled: true
      }
    })
  }

  const stepChanged = (stepState, jumpOutDisabled) => {
    if (stepState === 'invalid') {
      // TODO: probably not necessary, already implicit done in the next steps
      reset()
      return
    }

    setState(() => {
      return {
        intoBackDisabled: stepState === 'initial',
        overBackDisabled: stepState === 'initial',
        jumpPreviousBreakpointDisabled: stepState === 'initial',
        intoForwardDisabled: stepState === 'end',
        overForwardDisabled: stepState === 'end',
        jumpNextBreakpointDisabled: stepState === 'end',
        jumpOutDisabled: jumpOutDisabled ? jumpOutDisabled : true
      }
    })
  }

  return (
    <div className="buttons">
      <div className="stepButtons btn-group py-1">
        <button id='overback' className='btn btn-primary btn-sm navigator stepButton fas fa-reply' title='Step over back' onClick={() => { stepManager.stepOverBack() }} disabled={state.overBackDisabled} ></button>
        <button id='intoback' data-id="buttonNavigatorIntoBack" className='btn btn-primary btn-sm navigator stepButton fas fa-level-up-alt' title='Step back' onClick={() => { stepManager.stepIntoBack() }} disabled={state.intoBackDisabled}></button>
        <button id='intoforward' data-id="buttonNavigatorIntoForward" className='btn btn-primary btn-sm navigator stepButton fas fa-level-down-alt' title='Step into' onClick={() => { stepManager.stepIntoForward() }} disabled={state.intoForwardDisabled}></button>
        <button id='overforward' className='btn btn-primary btn-sm navigator stepButton fas fa-share' title='Step over forward' onClick={() => { stepManager.stepOverForward() }} disabled={state.overForwardDisabled}></button>
      </div>

      <div className="jumpButtons btn-group py-1">
        <button className='btn btn-primary btn-sm navigator jumpButton fas fa-step-backward'  id='jumppreviousbreakpoint' data-id="buttonNavigatorJumpPreviousBreakpoint" title='Jump to the previous breakpoint' onClick={() => { stepManager.jumpPreviousBreakpoint() }} disabled={state.jumpPreviousBreakpointDisabled}></button>
        <button className='btn btn-primary btn-sm navigator jumpButton fas fa-eject' id='jumpout' title='Jump out' onClick={() => { stepManager.jumpOut() }} disabled={state.jumpOutDisabled}></button>
        <button className='btn btn-primary btn-sm navigator jumpButton fas fa-step-forward' id='jumpnextbreakpoint' data-id="buttonNavigatorJumpNextBreakpoint" title='Jump to the next breakpoint' onClick={() => { stepManager.jumpNextBreakpoint() }} disabled={state.jumpNextBreakpointDisabled}></button>
      </div>
      <div id='reverted' style={{ display: revertedReason === '' ? 'none' : 'block' }}>
        <button id='jumptoexception' title='Jump to exception' className='btn btn-danger btn-sm navigator button fas fa-exclamation-triangle' onClick={() => { stepManager.jumpToException() }} disabled={state.jumpOutDisabled}>
        </button>
        <span>State changes made during this call will be reverted.</span>
        <span id='outofgas' style={{ display: revertedReason === 'outofgas' ? 'inline' : 'none' }}>This call will run out of gas.</span>
        <span id='parenthasthrown' style={{ display: revertedReason === 'parenthasthrown' ? 'inline' : 'none' }}>The parent call will throw an exception</span>
      </div>
    </div>
  )
}

export default ButtonNavigation
