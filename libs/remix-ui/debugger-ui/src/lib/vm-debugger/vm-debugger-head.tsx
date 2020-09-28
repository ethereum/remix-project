import React, { useState, useEffect } from 'react'
import CodeListView from './code-list-view'
import FunctionPanel from './function-panel'
import StepDetail from './step-detail'
import SolidityState from './solidity-state'
import SolidityLocals from './solidity-locals'

export const VmDebuggerHead = ({ vmDebuggerLogic, ready }) => {
  const [asm, setAsm] = useState({
    code: null,
    address: null,
    index: null
  })
  const [functionPanel, setFunctionPanel] = useState(null)
  const [stepDetail, setStepDetail] = useState({
    'vm trace step': '-',
    'execution step': '-',
    'add memory': '',
    'gas': '',
    'remaining gas': '-',
    'loaded address': '-'
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
    if (vmDebuggerLogic) {
      vmDebuggerLogic.event.register('codeManagerChanged', (code, address, index) => {
        setAsm(() => {
          return { code, address, index }
        })
      })
      vmDebuggerLogic.event.register('traceUnloaded', () => {
        setAsm(() => {
          return { code: [], address: '', index: -1 }
        })
      })
      vmDebuggerLogic.event.register('functionsStackUpdate', (stack) => {
        if (stack === null) return
        const functions = []
    
        for (const func of stack) {
          const functionDefinitionName = func.functionDefinition.name || func.functionDefinition.attributes.name

          functions.push(functionDefinitionName + '(' + func.inputs.join(', ') + ')')
        }
        setFunctionPanel(() => functions)
      })
      vmDebuggerLogic.event.register('traceUnloaded', () => {
        setStepDetail(() => {
          return { 'vm trace step': '-', 'execution step': '-', 'add memory': '', 'gas': '', 'remaining gas': '-', 'loaded address': '-' }
        })
      })
      vmDebuggerLogic.event.register('newTraceLoaded', () => {
        setStepDetail(() => {
          return { 'vm trace step': '-', 'execution step': '-', 'add memory': '', 'gas': '', 'remaining gas': '-', 'loaded address': '-' }
        })
      })
      vmDebuggerLogic.event.register('traceCurrentStepUpdate', (error, step) => {
        setStepDetail(prevState => {
          return { ...prevState, 'execution step': (error ? '-' : step) }
        })
      })
      vmDebuggerLogic.event.register('traceMemExpandUpdate', (error, addmem) => {
        setStepDetail(prevState => {
          return { ...prevState, 'add memory': (error ? '-' : addmem) }
        })
      })
      vmDebuggerLogic.event.register('traceStepCostUpdate', (error, gas) => {
        setStepDetail(prevState => {
          return { ...prevState, 'gas': (error ? '-' : gas) }
        })
      })
      vmDebuggerLogic.event.register('traceCurrentCalledAddressAtUpdate', (error, address) => {
        setStepDetail(prevState => {
          return { ...prevState, 'loaded address': (error ? '-' : address) }
        })
      })
      vmDebuggerLogic.event.register('traceRemainingGasUpdate', (error, remainingGas) => {
        setStepDetail(prevState => {
          return { ...prevState, 'remaining gas': (error ? '-' : remainingGas) }
        })
      })
      vmDebuggerLogic.event.register('indexUpdate', (index) => {
        setStepDetail(prevState => {
          return { ...prevState, 'vm trace step': index }
        })
      })
      vmDebuggerLogic.event.register('solidityState', (calldata) => {
        setSolidityState(() => {
          return { ...solidityState, calldata }
        })
      })
      vmDebuggerLogic.event.register('solidityStateMessage', (message) => {
        setSolidityState(() => {
          return { ...solidityState, message }
        })
      })
      vmDebuggerLogic.event.register('solidityLocals', (calldata) => {
        setSolidityLocals(() => {
          return { ...solidityLocals, calldata }
        })
      })
      vmDebuggerLogic.event.register('solidityLocalsMessage', (message) => {
        setSolidityLocals(() => {
          return { ...solidityLocals, message }
        })
      })
      ready()
    }
  }, [vmDebuggerLogic])

  return (
    <div id="vmheadView" className="mt-1 px-0">
      <div className="d-flex flex-column">
        <div className="w-100">
          <FunctionPanel calldata={functionPanel} />
          <SolidityLocals calldata={solidityLocals.calldata} message={solidityLocals.message} />
          <SolidityState calldata={solidityState.calldata} message={solidityState.message} />
        </div>
        <div className="w-100"><CodeListView asm={asm} /></div>
        <div className="w-100"><StepDetail stepDetail={stepDetail} /></div>
      </div>
    </div>
  )
}

export default VmDebuggerHead
