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

  const stepBtnStyle = 'd-flex align-items-center justify-content-center btn btn-primary btn-sm stepButton h-75 m-0 p-1'
  const disableStepBtnStyle = 'stepButtonDisabled'
  const jumpBtnStyle = 'd-flex align-items-center justify-content-center btn btn-primary btn-sm jumpButton h-75 m-0 p-1'
  const disableJumpBtnStyle = 'jumpButtonDisabled'

  return (
    <div className="buttons">
      <div className="stepButtons btn-group py-1">
        <OverlayTrigger
          placement="top-start"
          overlay={
            <Tooltip className="text-nowrap" id="overbackTooltip">
              <span>Step over back</span>
            </Tooltip>
          }
        >
          <div className={state.overBackDisabled ? `${stepBtnStyle} ${disableStepBtnStyle}`: `${stepBtnStyle}`} onClick={() => { stepOverBack && stepOverBack() }}>
            <button id='overback' className='btn btn-link btn-sm stepButton m-0 p-0' onClick={() => { stepOverBack && stepOverBack() }} disabled={state.overBackDisabled} style={{ pointerEvents: 'none', color: 'white' }}>
                <span className="fas fa-reply"></span>
            </button>
          </div>
        </OverlayTrigger>
        <OverlayTrigger
          placement="top-start"
          overlay={
            <Tooltip className="text-nowrap" id="intobackTooltip">
              <span>Step back</span>
            </Tooltip>
          }
        >
          <div className={state.intoBackDisabled ? `${stepBtnStyle} ${disableStepBtnStyle}`: `${stepBtnStyle}`} onClick={() => { stepIntoBack && stepIntoBack() }} data-id="buttonNavigatorIntoBack" id="buttonNavigatorIntoBackContainer">
            <button id='intoback' data-id="buttonNavigatorIntoBack" className='btn btn-link btn-sm stepButton m-0 p-0' onClick={() => { stepIntoBack && stepIntoBack() }} disabled={state.intoBackDisabled} style={{ pointerEvents: 'none', color: 'white' }}>
                <span className="fas fa-level-up-alt"></span>
            </button>
          </div>
        </OverlayTrigger>
        <OverlayTrigger
          placement="top-start"
          overlay={
            <Tooltip className="text-nowrap" id="intoforwardTooltip">
              <span>Step into</span>
            </Tooltip>
          }
        >
          <div className={state.intoForwardDisabled ? `${stepBtnStyle} ${disableStepBtnStyle}`: `${stepBtnStyle}`} onClick={() => { stepIntoForward && stepIntoForward() }} data-id="buttonNavigatorIntoForward" id="buttonNavigatorIntoFowardContainer">
            <button id='intoforward' data-id="buttonNavigatorIntoForward" className='btn btn-link btn-sm stepButton m-0 p-0' onClick={() => { stepIntoForward && stepIntoForward() }} disabled={state.intoForwardDisabled}
            style={{ pointerEvents: 'none', color: 'white' }}
            >
                <span className="fas fa-level-down-alt"></span>
            </button>
          </div>
        </OverlayTrigger>
        <OverlayTrigger
          placement="top-end"
          overlay={
            <Tooltip className="text-nowrap" id="overforwardTooltip">
              <span>Step over forward</span>
            </Tooltip>
          }
        >
          <div className={state.overForwardDisabled ? `${stepBtnStyle} ${disableStepBtnStyle}`: `${stepBtnStyle}`} onClick={() => { stepOverForward && stepOverForward() }} data-id="buttonNavigatorOverForward" id="buttonNavigatorOverForwardContainer">
            <button id='overforward' className='btn btn-link btn-sm stepButton m-0 p-0' onClick={() => { stepOverForward && stepOverForward() }} disabled={state.overForwardDisabled} style={{ pointerEvents: 'none', color: 'white' }}>
                <span className="fas fa-share"></span>
            </button>
          </div>
        </OverlayTrigger>
      </div>

      <div className="jumpButtons btn-group py-1">
          <OverlayTrigger
            placement="top-start"
            overlay={
              <Tooltip id="jumppreviousbreakpointTooltip" className="text-nowrap">
                <span>{'Jump to the previous breakpoint'}</span>
              </Tooltip>
            }
          >
            <div className={state.jumpPreviousBreakpointDisabled ? `${stepBtnStyle} ${disableJumpBtnStyle}`: `${stepBtnStyle}`} id="buttonNavigatorJumpPreviousBreakpointContainer" onClick={() => { jumpPreviousBreakpoint && jumpPreviousBreakpoint() }} data-id="buttonNavigatorJumpPreviousBreakpoint">
              <button className='btn btn-link btn-sm jumpButton m-0 p-0' id='jumppreviousbreakpoint' data-id="buttonNavigatorJumpPreviousBreakpoint" onClick={() => { jumpPreviousBreakpoint && jumpPreviousBreakpoint() }} disabled={state.jumpPreviousBreakpointDisabled} style={{ pointerEvents: 'none', backgroundColor: 'inherit', color: 'white' }}>
                  <span className="fas fa-step-backward"></span>
              </button>
            </div>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top-end"
            overlay={
              <Tooltip id="jumpoutTooltip" className="text-nowrap">
                <span>{'Jump out'}</span>
              </Tooltip>
            }
          >
            <div className={state.jumpOutDisabled ? `${stepBtnStyle} ${disableStepBtnStyle}`: `${stepBtnStyle}`} onClick={() => { jumpOut && jumpOut() }} data-id="buttonNavigatorJumpOut" id="buttonNavigatorJumpOutContainer">
              <button className='btn btn-link btn-sm jumpButton m-0 p-0' id='jumpout' onClick={() => { jumpOut && jumpOut() }} disabled={state.jumpOutDisabled} style={{ pointerEvents: 'none', backgroundColor: 'inherit', color: 'white' }} data-id="buttonNavigatorJumpOut">
                  <span className="fas fa-eject"></span>
              </button>
            </div>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top-end"
            overlay={
              <Tooltip id="jumpnextbreakpointTooltip" className="text-nowrap">
                <span>{'Jump to the next breakpoint'}</span>
              </Tooltip>
            }
          >
            <div className={state.jumpNextBreakpointDisabled ? `${stepBtnStyle} ${disableStepBtnStyle}`: `${stepBtnStyle}`} onClick={() => { jumpNextBreakpoint && jumpNextBreakpoint() }} data-id="buttonNavigatorJumpNextBreakpoint" id="buttonNavigatorJumpNextBreakpointContainer">
              <button className='btn btn-link btn-sm jumpButton m-0 p-0' id='jumpnextbreakpoint' data-id="buttonNavigatorJumpNextBreakpoint" onClick={() => { jumpNextBreakpoint && jumpNextBreakpoint() }} disabled={state.jumpNextBreakpointDisabled} style={{ pointerEvents: 'none', color: 'white' }}>
                  <span className="fas fa-step-forward"></span>
              </button>
            </div>
          </OverlayTrigger>
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
