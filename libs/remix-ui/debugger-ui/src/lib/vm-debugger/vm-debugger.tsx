import React, { useState, useEffect } from 'react'
import CodeListView from './code-list-view'
import CalldataPanel from './calldata-panel'
import MemoryPanel from './memory-panel'
import CallstackPanel from './callstack-panel'
import FunctionPanel from './function-panel'
import StackPanel from './stack-panel'
import StoragePanel from './storage-panel'
import StepDetail from './step-detail'
import SolidityState from './solidity-state'
import SolidityLocals from './solidity-locals'
import FullStoragesChangesPanel from './full-storages-changes'
import DropdownPanel from './dropdown-panel'
import './vm-debugger.css';

export const VmDebugger = ({ vmDebuggerLogic }) => {
  const [panelVisibility, setPanelVisibility] = useState({
    asmCode: true,
    stackPanel: true,
    functionPanel: true,
    storagePanel: true,
    memoryPanel: true,
    stepDetail: true,
    calldataPanel: true,
    callstackPanel: true,
    solidityState: true,
    solidityLocals: true,
    solidityPanel: true,
    returnValuesPanel: true,
    fullStoragesChangesPanel: true
  })
  const [asm, setAsm] = useState({
    code: null,
    address: null,
    index: null
  })
  const [calldataPanel, setCalldataPanel] = useState(null)
  const [memoryPanel, setMemoryPanel] = useState(null)
  const [callStackPanel, setCallStackPanel] = useState(null)
  const [stackPanel, setStackPanel] = useState(null)
  const [functionPanel, setFunctionPanel] = useState(null)
  const [storagePanel, setStoragePanel] = useState({
    calldata: null,
    header: null
  })
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
  const [returnValuesPanel, setReturnValuesPanel] = useState({})
  const [fullStoragesChangesPanel, setFullStoragesChangesPanel] = useState(null)

  useEffect(() => {
    vmDebuggerLogic.event.register('codeManagerChanged', (code, address, index) => {
      setAsm({ code, address, index })
    })
    vmDebuggerLogic.event.register('traceUnloaded', () => {
      setAsm({ code: [], address: '', index: -1 })
    })
    vmDebuggerLogic.event.register('traceManagerCallDataUpdate', (calldata) => {
      setCalldataPanel(calldata)
    })
    vmDebuggerLogic.event.register('traceManagerMemoryUpdate', (calldata) => {
      setMemoryPanel(calldata)
    })
    vmDebuggerLogic.event.register('traceManagerCallStackUpdate', (calldata) => {
      setCallStackPanel(calldata)
    })
    vmDebuggerLogic.event.register('traceManagerStackUpdate', (calldata) => {
      setStackPanel(calldata)
    })
    vmDebuggerLogic.event.register('functionsStackUpdate', (stack) => {
      if (stack === null) return
      const functions = []
  
      for (const func of stack) {
        functions.push(func.functionDefinition.attributes.name + '(' + func.inputs.join(', ') + ')')
      }
      setFunctionPanel(functions)
    })
    vmDebuggerLogic.event.register('traceManagerStorageUpdate', (calldata, header) => {
      setStoragePanel({ calldata, header })
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
    vmDebuggerLogic.event.register('traceReturnValueUpdate', (calldata) => {
      setReturnValuesPanel(calldata)
    })
    vmDebuggerLogic.event.register('traceAddressesUpdate', (_addreses) => {
      setFullStoragesChangesPanel({})
    })
    vmDebuggerLogic.event.register('traceStorageUpdate', (calldata) => {
      setFullStoragesChangesPanel(calldata)
    })
    vmDebuggerLogic.event.register('newTrace', () => {
      setPanelVisibility({
        asmCode: true,
        stackPanel: true,
        functionPanel: true,
        storagePanel: true,
        memoryPanel: true,
        stepDetail: true,
        calldataPanel: true,
        callstackPanel: true,
        solidityState: true,
        solidityLocals: true,
        solidityPanel: true,
        returnValuesPanel: true,
        fullStoragesChangesPanel: true
      })
    })
    vmDebuggerLogic.event.register('newCallTree', () => {
      setPanelVisibility({
        ...panelVisibility,
        solidityPanel: false
      })
    })
    vmDebuggerLogic.start()
  }, [])

  const renderHead = () => {
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

  return (
    <div id="vmdebugger" className="px-2">
      <div>
        <StackPanel calldata={stackPanel} />
        <MemoryPanel calldata={memoryPanel} />
        <StoragePanel storage={storagePanel.calldata} header={storagePanel.header} />
        <CallstackPanel calldata={callStackPanel} />
        <CalldataPanel calldata={calldataPanel} />
        <DropdownPanel dropdownName='Return Value' opts={{ json: true }} calldata={returnValuesPanel} />
        <FullStoragesChangesPanel storageData={fullStoragesChangesPanel} />
      </div>
    </div>
  )
}

export default VmDebugger;
