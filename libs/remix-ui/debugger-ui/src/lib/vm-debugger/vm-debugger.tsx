import React, { useState, useEffect } from 'react' // eslint-disable-line
import CalldataPanel from './calldata-panel' // eslint-disable-line
import MemoryPanel from './memory-panel' // eslint-disable-line
import CallstackPanel from './callstack-panel' // eslint-disable-line
import StackPanel from './stack-panel' // eslint-disable-line
import StoragePanel from './storage-panel' // eslint-disable-line
import ReturnValuesPanel from './dropdown-panel' // eslint-disable-line
import FullStoragesChangesPanel from './full-storages-changes' // eslint-disable-line
import GlobalVariables from './global-variables' // eslint-disable-line

export const VmDebugger = ({ vmDebugger: { registerEvent }, currentBlock, currentReceipt, currentTransaction }) => {
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
    registerEvent && registerEvent('traceManagerCallDataUpdate', (calldata) => {
      setCalldataPanel(() => calldata)
    })
    registerEvent && registerEvent('traceManagerMemoryUpdate', (calldata) => {
      setMemoryPanel(() => calldata)
    })
    registerEvent && registerEvent('traceManagerCallStackUpdate', (calldata) => {
      setCallStackPanel(() => calldata)
    })
    registerEvent && registerEvent('traceManagerStackUpdate', (calldata) => {
      setStackPanel(() => calldata)
    })
    registerEvent && registerEvent('traceManagerStorageUpdate', (calldata, header) => {
      setStoragePanel(() => {
        return { calldata, header }
      })
    })
    registerEvent && registerEvent('traceReturnValueUpdate', (calldata) => {
      setReturnValuesPanel(() => calldata)
    })
    registerEvent && registerEvent('traceAddressesUpdate', (calldata) => {
      setFullStoragesChangesPanel(() => {
        return {}
      })
    })
    registerEvent && registerEvent('traceStorageUpdate', (calldata) => {
      setFullStoragesChangesPanel(() => calldata)
    })
  }, [registerEvent])

  return (
    <div id='vmdebugger' className="d-flex">
      <div className='d-flex flex-column pr-2' style={{ flex: 1 }}>
        <CallstackPanel className="pb-1" calldata={callStackPanel} />
        <StackPanel className="pb-1" calldata={stackPanel} />
        <MemoryPanel className="pb-1" calldata={memoryPanel} />
        <StoragePanel className="pb-1" calldata={storagePanel.calldata} header={storagePanel.header} />
      </div>
      <div className='d-flex flex-column pl-2' style={{ flex: 1 }}>
        <CalldataPanel className="pb-1" calldata={calldataPanel} />
        <GlobalVariables className="pb-1" block={currentBlock} receipt={currentReceipt} tx={currentTransaction} />
        <ReturnValuesPanel className="pb-1" dropdownName='Return Value' calldata={returnValuesPanel || {}} />
        <FullStoragesChangesPanel className="pb-1" calldata={fullStoragesChangesPanel} />
      </div>
    </div>
  )
}

export default VmDebugger
