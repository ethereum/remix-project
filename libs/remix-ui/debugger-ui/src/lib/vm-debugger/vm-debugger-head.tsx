import React, { useState, useEffect } from 'react'
import CodeListView from './code-list-view'
import FunctionPanel from './function-panel'
import StepDetail from './step-detail'
import SolidityState from './solidity-state'
import SolidityLocals from './solidity-locals'

export const VmDebuggerHead = ({ vmDebuggerHead: { registerEvent } }) => {
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
    registerEvent && registerEvent('codeManagerChanged', (code, address, index) => {
      setAsm(() => {
        return { code, address, index }
      })
    })
    registerEvent && registerEvent('traceUnloaded', () => {
      setAsm(() => {
        return { code: [], address: '', index: -1 }
      })
    })
    registerEvent && registerEvent('functionsStackUpdate', (stack) => {
      if (stack === null || stack.length === 0) return
      const functions = []
  
      for (const func of stack) {
        functions.push(func.functionDefinition.name + '(' + func.inputs.join(', ') + ')')
      }
      setFunctionPanel(() => functions)
    })
    registerEvent && registerEvent('traceUnloaded', () => {
      setStepDetail(() => {
        return { 'vm trace step': '-', 'execution step': '-', 'add memory': '', 'gas': '', 'remaining gas': '-', 'loaded address': '-' }
      })
    })
    registerEvent && registerEvent('newTraceLoaded', () => {
      setStepDetail(() => {
        return { 'vm trace step': '-', 'execution step': '-', 'add memory': '', 'gas': '', 'remaining gas': '-', 'loaded address': '-' }
      })
    })
    registerEvent && registerEvent('traceCurrentStepUpdate', (error, step) => {
      setStepDetail(prevState => {
        return { ...prevState, 'execution step': (error ? '-' : step) }
      })
    })
    registerEvent && registerEvent('traceMemExpandUpdate', (error, addmem) => {
      setStepDetail(prevState => {
        return { ...prevState, 'add memory': (error ? '-' : addmem) }
      })
    })
    registerEvent && registerEvent('traceStepCostUpdate', (error, gas) => {
      setStepDetail(prevState => {
        return { ...prevState, 'gas': (error ? '-' : gas) }
      })
    })
    registerEvent && registerEvent('traceCurrentCalledAddressAtUpdate', (error, address) => {
      setStepDetail(prevState => {
        return { ...prevState, 'loaded address': (error ? '-' : address) }
      })
    })
    registerEvent && registerEvent('traceRemainingGasUpdate', (error, remainingGas) => {
      setStepDetail(prevState => {
        return { ...prevState, 'remaining gas': (error ? '-' : remainingGas) }
      })
    })
    registerEvent && registerEvent('indexUpdate', (index) => {
      setStepDetail(prevState => {
        return { ...prevState, 'vm trace step': index }
      })
    })
    registerEvent && registerEvent('solidityState', (calldata) => {
      setSolidityState(() => {
        return { ...solidityState, calldata }
      })
    })
    registerEvent && registerEvent('solidityStateMessage', (message) => {
      setSolidityState(() => {
        return { ...solidityState, message }
      })
    })
    registerEvent && registerEvent('solidityLocals', (calldata) => {
      setSolidityLocals(() => {
        return { ...solidityLocals, calldata }
      })
    })
    registerEvent && registerEvent('solidityLocalsMessage', (message) => {
      setSolidityLocals(() => {
        return { ...solidityLocals, message }
      })
    })
  }, [registerEvent])

  return (
    <div id="vmheadView" className="mt-1 px-0">
      <div className="d-flex flex-column">
        <div className="w-100">
          <FunctionPanel data={functionPanel} />
          <SolidityLocals data={solidityLocals.calldata} message={solidityLocals.message} />
          {/* <SolidityState calldata={solidityState.calldata} message={solidityState.message} /> */}
        </div>
        <div className="w-100"><CodeListView registerEvent={registerEvent} /></div>
        {/* <div className="w-100"><StepDetail stepDetail={stepDetail} /></div> */}
      </div>
    </div>
  )
}

export default VmDebuggerHead
