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
  const [state, setState] = useState({
  })
  const [asm, setAsm] = useState({
    code: null,
    address: null,
    index: null
  })
  const [calldataPanel, setCalldataPanel] = useState(null)
  const [memoryPanel, setMemoryPanel] = useState(null)
  const [callStackPanel, setCallStackPanel] = useState(null)

  useEffect(() => {
    vmDebuggerLogic.event.register('codeManagerChanged', updateAsm)
    vmDebuggerLogic.event.register('traceUnloaded', resetAsm)
    vmDebuggerLogic.event.register('traceManagerCallDataUpdate', updateCalldataPanel)
    vmDebuggerLogic.event.register('traceManagerMemoryUpdate', updateMemoryPanel)
    vmDebuggerLogic.event.register('traceManagerCallStackUpdate', updateCallStackPanel)
  }, [])

  const updateAsm = (code, address, index) => {
    setAsm({
      code,
      address,
      index
    })
  }

  const resetAsm = () => {
    setAsm({
      code: [],
      address: '',
      index: -1
    })
  }

  const updateCalldataPanel = (calldata) => {
    setCalldataPanel(calldata)
  }

  const updateMemoryPanel = (calldata) => {
    setMemoryPanel(calldata)
  }

  const updateCallStackPanel = (calldata) => {
    setCallStackPanel(calldata)
  }

  useEffect(() => {
    vmDebuggerLogic.event.register('codeManagerChanged', )
  }, [])

  const renderHead = () => {
      return (
        <div id="vmheadView" className="mt-1 px-0">
          <div className="d-flex flex-column">
            <div className="w-100" hidden>
              {this.functionPanel.render()}
              {this.solidityLocals.render()}
              {this.solidityState.render()}
            </div>
            <div className="w-100">{this.asmCode.render()}</div>
            <div className="w-100">{this.stepDetail.render()}</div>
          </div>
        </div>
      )
  }

  return (
    <div id="vmdebugger" className="px-2">
      <div>
        {this.stackPanel.render()}
        {this.memoryPanel.render()}
        {this.storagePanel.render()}
        {this.callstackPanel.render()}
        {this.calldataPanel.render()}
        {this.returnValuesPanel.render()}
        {this.fullStoragesChangesPanel.render()}
      </div>
    </div>
  );
};

export default VmDebugger;
