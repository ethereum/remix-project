import React, { useState, useEffect } from 'react'
import CalldataPanel from './calldata-panel'
import MemoryPanel from './memory-panel'
import CallstackPanel from './callstack-panel'
import StackPanel from './stack-panel'
import StoragePanel from './storage-panel'
import ReturnValuesPanel from './dropdown-panel'
import FullStoragesChangesPanel from './full-storages-changes'

export const VmDebugger = ({ vmDebuggerLogic, ready }) => {
  const [calldataPanel, setCalldataPanel] = useState(null)
  const [memoryPanel, setMemoryPanel] = useState(null)
  const [callStackPanel, setCallStackPanel] = useState(null)
  const [stackPanel, setStackPanel] = useState(null)
  const [storagePanel, setStoragePanel] = useState({
    calldata: null,
    header: null
  })
  const [returnValuesPanel, setReturnValuesPanel] = useState(null)
  const [fullStoragesChangesPanel, setFullStoragesChangesPanel] = useState(null)

  useEffect(() => {
    console.log('vmDebuggerLogic: ', vmDebuggerLogic)
    if (vmDebuggerLogic) {
      vmDebuggerLogic.event.register('traceManagerCallDataUpdate', (calldata) => {
        setCalldataPanel(() => calldata)
      })
      vmDebuggerLogic.event.register('traceManagerMemoryUpdate', (calldata) => {
        setMemoryPanel(() => calldata)
      })
      vmDebuggerLogic.event.register('traceManagerCallStackUpdate', (calldata) => {
        setCallStackPanel(() => calldata)
      })
      vmDebuggerLogic.event.register('traceManagerStackUpdate', (calldata) => {
        setStackPanel(() => calldata)
      })
      vmDebuggerLogic.event.register('traceManagerStorageUpdate', (calldata, header) => {
        setStoragePanel(() => {
          return { calldata, header }
        })
      })
      vmDebuggerLogic.event.register('traceReturnValueUpdate', (calldata) => {
        setReturnValuesPanel(() => calldata)
      })
      vmDebuggerLogic.event.register('traceAddressesUpdate', (calldata) => {
        setFullStoragesChangesPanel(() => {
          return {}
        })
      })
      vmDebuggerLogic.event.register('traceStorageUpdate', (calldata) => {
        setFullStoragesChangesPanel(() => calldata)
      })
      ready()
    }
  }, [vmDebuggerLogic])

  return (
    <div id="vmdebugger" className="px-2">
      <div>
        <StackPanel calldata={stackPanel} />
        <MemoryPanel calldata={memoryPanel} />
        <StoragePanel calldata={storagePanel.calldata} header={storagePanel.header} />
        <CallstackPanel calldata={callStackPanel} />
        <CalldataPanel calldata={calldataPanel} />
        <ReturnValuesPanel dropdownName="Return Value" calldata={returnValuesPanel || {}} />
        <FullStoragesChangesPanel calldata={fullStoragesChangesPanel} />
      </div>
    </div>
  )
}

export default VmDebugger
