import React, { useState, useEffect } from 'react' // eslint-disable-line
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import './button-navigator.css'

export const ButtonNavigation = ({ stepOverBack, stepIntoBack, stepIntoForward, stepOverForward, jumpOut, jumpPreviousBreakpoint, jumpNextBreakpoint, jumpToException, revertedReason, stepState, jumpOutDisabled }) => {
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
        jumpOutDisabled: (jumpOutDisabled !== null) && (jumpOutDisabled !== undefined) ? jumpOutDisabled : true
      }
    })
  }

  return (
    <div className="buttons">
      <div className="stepButtons btn-group py-1">
        <button id='overback' className='btn btn-primary btn-sm navigator stepButton' title='Step over back' onClick={() => { stepOverBack && stepOverBack() }} disabled={state.overBackDisabled} >
          <OverlayTrigger
            placement="top-start"
            overlay={
              <Tooltip className="text-nowrap" id="overbackTooltip">
                <span>Step over back</span>
              </Tooltip>
            }
          >
            <span className="fas fa-reply"></span>
          </OverlayTrigger>
        </button>
        <button id='intoback' data-id="buttonNavigatorIntoBack" className='btn btn-primary btn-sm navigator stepButton' title='Step back' onClick={() => { stepIntoBack && stepIntoBack() }} disabled={state.intoBackDisabled}>
          <OverlayTrigger
            placement="top-start"
            overlay={
              <Tooltip className="text-nowrap" id="intobackTooltip">
                <span>Step back</span>
              </Tooltip>
            }
          >
            <span className="fas fa-level-up-alt"></span>
          </OverlayTrigger>
        </button>
        <button id='intoforward' data-id="buttonNavigatorIntoForward" className='btn btn-primary btn-sm navigator stepButton' title='Step into' onClick={() => { stepIntoForward && stepIntoForward() }} disabled={state.intoForwardDisabled}>
          <OverlayTrigger
            placement="top-start"
            overlay={
              <Tooltip className="text-nowrap" id="intoforwardTooltip">
                <span>Step into</span>
              </Tooltip>
            }
          >
            <span className="fas fa-level-down-alt"></span>
          </OverlayTrigger>
        </button>
        <button id='overforward' className='btn btn-primary btn-sm navigator stepButton' title='Step over forward' onClick={() => { stepOverForward && stepOverForward() }} disabled={state.overForwardDisabled}>
          <OverlayTrigger
            placement="top-end"
            overlay={
              <Tooltip className="text-nowrap" id="overforwardTooltip">
                <span>Step into</span>
              </Tooltip>
            }
          >
            <span className="fas fa-share"></span>
          </OverlayTrigger>
        </button>
      </div>

      <div className="jumpButtons btn-group py-1">
        <button className='btn btn-primary btn-sm navigator jumpButton' id='jumppreviousbreakpoint' data-id="buttonNavigatorJumpPreviousBreakpoint" onClick={() => { jumpPreviousBreakpoint && jumpPreviousBreakpoint() }} disabled={state.jumpPreviousBreakpointDisabled}>
          <OverlayTrigger
            placement="top-end"
            overlay={
              <Tooltip id="jumppreviousbreakpointTooltip" className="text-nowrap">
                <span>{'Jump to the previous breakpoint'}</span>
              </Tooltip>
            }
          >
            <span className="fas fa-step-backward"></span>
          </OverlayTrigger>
        </button>
        <button className='btn btn-primary btn-sm navigator jumpButton' id='jumpout' onClick={() => { jumpOut && jumpOut() }} disabled={state.jumpOutDisabled}>
          <OverlayTrigger
            placement="top-end"
            overlay={
              <Tooltip id="jumpoutTooltip" className="text-nowrap">
                <span>{'Jump out'}</span>
              </Tooltip>
            }
          >
            <span className="fas fa-eject"></span>
          </OverlayTrigger>
        </button>
        <button className='btn btn-primary btn-sm navigator jumpButton' id='jumpnextbreakpoint' data-id="buttonNavigatorJumpNextBreakpoint" onClick={() => { jumpNextBreakpoint && jumpNextBreakpoint() }} disabled={state.jumpNextBreakpointDisabled}>
          <OverlayTrigger
            placement="top-end"
            overlay={
              <Tooltip id="jumpnextbreakpointTooltip" className="text-nowrap">
                <span>{'Jump to the next breakpoint'}</span>
              </Tooltip>
            }
          >
            <span className="fas fa-step-forward"></span>
          </OverlayTrigger>
        </button>
      </div>
      <div id='reverted' style={{ display: revertedReason === '' ? 'none' : 'block' }}>
        <span className='text-warning'>This call has reverted, state changes made during the call will be reverted.</span>
        <span className='text-warning' id='outofgas' style={{ display: revertedReason === 'outofgas' ? 'inline' : 'none' }}>This call will run out of gas.</span>
        <span className='text-warning' id='parenthasthrown' style={{ display: revertedReason === 'parenthasthrown' ? 'inline' : 'none' }}>The parent call will throw an exception</span>
        <div className='text-warning'>Click <u data-id="debugGoToRevert" className="cursorPointerRemixDebugger" role="button" onClick={() => { jumpToException && jumpToException() }}>here</u> to jump where the call reverted.</div>
      </div>
    </div>
  )
}

export default ButtonNavigation
