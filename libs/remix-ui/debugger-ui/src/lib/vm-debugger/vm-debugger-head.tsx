import React, {useState, useEffect} from 'react' // eslint-disable-line
import CodeListView from './code-list-view' // eslint-disable-line
import FunctionPanel from './function-panel' // eslint-disable-line
import StepDetail from './step-detail' // eslint-disable-line
import SolidityState from './solidity-state' // eslint-disable-line
import SolidityLocals from './solidity-locals' // eslint-disable-line

export const VmDebuggerHead = ({vmDebugger: {registerEvent, triggerEvent}, debugging, stepManager}) => {
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
    message: null
  })
  const [solidityLocals, setSolidityLocals] = useState({
    calldata: null,
    message: null
  })

  useEffect(() => {
    registerEvent &&
      registerEvent('functionsStackUpdate', (stack) => {
        if (stack === null || stack.length === 0) return
        const functions = []

        for (const func of stack) {
          const label = (func.functionDefinition.name || func.functionDefinition.kind) + '(' + func.inputs.join(', ') + ')' + ' - ' + func.gasCost + ' gas'
          functions.push({
            label,
            function: func
          })
        }
        setFunctionPanel(() => functions)
      })
    registerEvent &&
      registerEvent('traceUnloaded', () => {
        setStepDetail(() => {
          return {
            'vm trace step': '-',
            'execution step': '-',
            'add memory': '',
            'gas': '',
            'remaining gas': '-',
            'loaded address': '-'
          }
        })
      })
    registerEvent &&
      registerEvent('newTraceLoaded', () => {
        setStepDetail(() => {
          return {
            'vm trace step': '-',
            'execution step': '-',
            'add memory': '',
            'gas': '',
            'remaining gas': '-',
            'loaded address': '-'
          }
        })
      })
    registerEvent &&
      registerEvent('traceCurrentStepUpdate', (error, step) => {
        setStepDetail((prevState) => {
          return {...prevState, 'execution step': error ? '-' : step}
        })
      })
    registerEvent &&
      registerEvent('traceMemExpandUpdate', (error, addmem) => {
        setStepDetail((prevState) => {
          return {...prevState, 'add memory': error ? '-' : addmem}
        })
      })
    registerEvent &&
      registerEvent('traceStepCostUpdate', (error, gas) => {
        setStepDetail((prevState) => {
          return {...prevState, gas: error ? '-' : gas}
        })
      })
    registerEvent &&
      registerEvent('traceCurrentCalledAddressAtUpdate', (error, address) => {
        setStepDetail((prevState) => {
          return {...prevState, 'loaded address': error ? '-' : address}
        })
      })
    registerEvent &&
      registerEvent('traceRemainingGasUpdate', (error, remainingGas) => {
        setStepDetail((prevState) => {
          return {...prevState, 'remaining gas': error ? '-' : remainingGas}
        })
      })
    registerEvent &&
      registerEvent('indexUpdate', (index) => {
        setStepDetail((prevState) => {
          return {...prevState, 'vm trace step': index}
        })
      })
    registerEvent &&
      registerEvent('solidityState', (calldata) => {
        setSolidityState(() => {
          return {...solidityState, calldata}
        })
      })
    registerEvent &&
      registerEvent('solidityStateMessage', (message) => {
        setSolidityState(() => {
          return {...solidityState, message}
        })
      })
    registerEvent &&
      registerEvent('solidityLocals', (calldata) => {
        setSolidityLocals(() => {
          return {...solidityLocals, calldata}
        })
      })
    registerEvent &&
      registerEvent('solidityLocalsMessage', (message) => {
        setSolidityLocals(() => {
          return {...solidityLocals, message}
        })
      })
  }, [debugging])

  return (
    <div id="vmheadView" className="mt-1 px-2 d-flex">
      <div className="d-flex flex-column pr-2" style={{flex: 1}}>
        <FunctionPanel className="pb-1" data={functionPanel} stepManager={stepManager} />
        <SolidityLocals className="pb-1" data={solidityLocals.calldata} message={solidityLocals.message} registerEvent={registerEvent} triggerEvent={triggerEvent} />
        <CodeListView className="pb-2 flex-grow-1" registerEvent={registerEvent} />
      </div>
      <div className="d-flex flex-column pl-2" style={{flex: 1}}>
        <SolidityState className="pb-1" calldata={solidityState.calldata} message={solidityState.message} />
        <StepDetail className="pb-1 pb-2 h-100 flex-grow-1" stepDetail={stepDetail} />
      </div>
    </div>
  )
}

export default VmDebuggerHead
