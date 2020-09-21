import React, { useState, useEffect } from 'react'
import CalldataPanel from './calldata-panel'
import MemoryPanel from './memory-panel'
import CallstackPanel from './callstack-panel'
import StackPanel from './stack-panel'
import StoragePanel from './storage-panel'

export const VmDebugger = ({ vmDebuggerLogic, ready }) => {
  const [panelVisibility, setPanelVisibility] = useState({
    asmCode: true,
    stackPanel: true,
    storagePanel: true,
    memoryPanel: true,
    calldataPanel: true,
    callstackPanel: true,
  })
  const [calldataPanel, setCalldataPanel] = useState(null)
  const [memoryPanel, setMemoryPanel] = useState(null)
  const [callStackPanel, setCallStackPanel] = useState(null)
  const [stackPanel, setStackPanel] = useState(null)
  const [storagePanel, setStoragePanel] = useState({
    calldata: null,
    header: null
  })

  useEffect(() => {
    if (vmDebuggerLogic) {
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
      vmDebuggerLogic.event.register('traceManagerStorageUpdate', (calldata, header) => {
        setStoragePanel({ calldata, header })
      })
      vmDebuggerLogic.event.register('newTrace', () => {
        setPanelVisibility({
          asmCode: true,
          stackPanel: true,
          storagePanel: true,
          memoryPanel: true,
          calldataPanel: true,
          callstackPanel: true,
        })
      })
      // vmDebuggerLogic.event.register('newCallTree', () => {
      //   setPanelVisibility({
      //     ...panelVisibility,
      //     solidityPanel: false
      //   })
      // })
      ready()
    }
  }, [vmDebuggerLogic])

  return (
    <div id="vmdebugger" className="px-2">
      <div>
        <StackPanel calldata={stackPanel || {}} />
        <MemoryPanel calldata={memoryPanel || {}} />
        <StoragePanel storage={storagePanel.calldata || {}} header={storagePanel.header} />
        <CallstackPanel calldata={callStackPanel || {}} />
        <CalldataPanel calldata={calldataPanel || {}} />
      </div>
    </div>
  )
}

export default VmDebugger
