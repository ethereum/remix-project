import React, { useState, useEffect } from 'react'
import CodeListView from './code-list-view'
import FunctionPanel from './function-panel'
import StepDetail from './step-detail'
import SolidityState from './solidity-state'
import SolidityLocals from './solidity-locals'

export const VmDebuggerHead = ({ vmDebuggerLogic }) => {
  const [panelVisibility, setPanelVisibility] = useState({
    functionPanel: true,
    stepDetail: true,
    solidityState: true,
    solidityLocals: true,
    returnValuesPanel: true,
    fullStoragesChangesPanel: true
  })
  const [asm, setAsm] = useState({
    code: null,
    address: null,
    index: null
  })
  const [functionPanel, setFunctionPanel] = useState(null)
  const [stepDetail, setStepDetail] = useState({
    key: null,
    value: null,
    reset: false
  })
  const [solidityState, setSolidityState] = useState({
    calldata: null,
    message: null,
  })
  const [solidityLocals, setSolidityLocals] = useState({
    calldata: null,
    message: null,
  })

  useEffect(() => {
    vmDebuggerLogic.event.register('codeManagerChanged', (code, address, index) => {
      setAsm({ code, address, index })
    })
    vmDebuggerLogic.event.register('traceUnloaded', () => {
      setAsm({ code: [], address: '', index: -1 })
    })
    vmDebuggerLogic.event.register('functionsStackUpdate', (stack) => {
      if (stack === null) return
      const functions = []
  
      for (const func of stack) {
        functions.push(func.functionDefinition.attributes.name + '(' + func.inputs.join(', ') + ')')
      }
      setFunctionPanel(functions)
    })
    vmDebuggerLogic.event.register('traceUnloaded', () => {
      setStepDetail({ key: null, value: null, reset: true })
    })
    vmDebuggerLogic.event.register('newTraceLoaded', () => {
      setStepDetail({ key: null, value: null, reset: true })
    })
    vmDebuggerLogic.event.register('traceCurrentStepUpdate', (error, step) => {
      setStepDetail({ key: 'execution step', value: (error ? '-' : step), reset: false })
    })
    vmDebuggerLogic.event.register('traceMemExpandUpdate', (error, addmem) => {
      setStepDetail({ key: 'add memory', value: (error ? '-' : addmem), reset: false })
    })
    vmDebuggerLogic.event.register('traceStepCostUpdate', (error, gas) => {
      setStepDetail({ key: 'gas', value: (error ? '-' : gas), reset: false })
    })
    vmDebuggerLogic.event.register('traceCurrentCalledAddressAtUpdate', (error, address) => {
      setStepDetail({ key: 'loaded address', value: (error ? '-' : address), reset: false })
    })
    vmDebuggerLogic.event.register('traceRemainingGasUpdate', (error, remainingGas) => {
      setStepDetail({ key: 'remaining gas', value: (error ? '-' : remainingGas), reset: false })
    })
    vmDebuggerLogic.event.register('indexUpdate', (index) => {
      setStepDetail({ key: 'vm trace step', value: index, reset: false })
    })
    vmDebuggerLogic.event.register('solidityState', (calldata) => {
      setSolidityState({ ...solidityState, calldata })
    })
    vmDebuggerLogic.event.register('solidityStateMessage', (message) => {
      setSolidityState({ ...solidityState, message })
    })
    vmDebuggerLogic.event.register('solidityLocals', (calldata) => {
      setSolidityLocals({ ...solidityState, calldata })
    })
    vmDebuggerLogic.event.register('solidityLocalsMessage', (message) => {
      setSolidityLocals({ ...solidityState, message })
    })
    vmDebuggerLogic.event.register('newTrace', () => {
      setPanelVisibility({
        functionPanel: true,
        stepDetail: true,
        solidityState: true,
        solidityLocals: true,
        returnValuesPanel: true,
        fullStoragesChangesPanel: true
      })
    })
    vmDebuggerLogic.start()
  }, [])

  return (
    <div id="vmheadView" className="mt-1 px-0">
      <div className="d-flex flex-column">
        <div className="w-100" hidden>
          <FunctionPanel calldata={functionPanel} />
          <SolidityLocals calldata={solidityLocals.calldata} message={solidityLocals.message} />
          <SolidityState calldata={solidityState.calldata} message={solidityState.message} />
        </div>
        <div className="w-100"><CodeListView asm={asm} /></div>
        <div className="w-100"><StepDetail detail={stepDetail} /></div>
      </div>
    </div>
  )
}

export default VmDebuggerHead;
