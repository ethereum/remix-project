import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { createClient } from '@remixproject/plugin-webview'
import { PluginClient } from '@remixproject/plugin'
import { CompiledContract, ABIDescription, BytecodeObject } from '@remixproject/plugin-api'
import { json } from 'starknet'
import factoryContract from './factory.json'

import { useEffect, useRef, useState } from 'react'

import './App.css'

declare global {
  interface Window { ethereum: any; web3: Web3 }
}

type ABIParameter = {
  internalType: string;
  name: string;
  type: string
}

type CompiledContractJSON = {
  data: {
    bytecode: BytecodeObject;
  }
}

type VariableType = { 
  [key: string]: {
    type: string;
    value: string
  }
}

const getHint = (str: string) => {
  if(str.includes('[]')) {
    return '- Arguments separated with comma' 
  }
  return ''
}

const arrayify = (str: string) => str.split(',').map(s => s.trim())

const makeHex = (str: string) => window.web3.utils.asciiToHex(str)

const encodeBytes = (params: string | string[]) => {
  if(Array.isArray(params)) {
    return params.map(makeHex)
  }
  return makeHex(params)
}

function App() {
  const client = useRef(createClient(new PluginClient()))
  const [constructorInput, setConstructorInput] = useState<ABIDescription | null>(null)
  const [contractToDeploy, setContract] = useState<unknown>(null)
  const [customInput, setCustomInput] = useState<VariableType>({})
  const [accounts, setAccounts] = useState<string[]>([])
  const [salt, setSalt] = useState<string>('')
  const [depoyedAddress, setDeployedAddress] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(false)

  const handleParsing = async () => {
    const filePath = await client.current.call('fileManager', 'getCurrentFile');
    const contractJson = await client.current.call('fileManager', 'readFile', filePath);
    const contract = json.parse(contractJson) as CompiledContract;
    const constructor = contract.abi.find((singleAbi) => singleAbi.type === 'constructor');

    if(constructor) {
      if(constructor.inputs && constructor.inputs.length > 0) {
        setConstructorInput(constructor)
      }
    } 

    setContract(contract)
  }

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        window.web3 = new Web3(window.ethereum);
        window.web3.eth.getAccounts((_, result) => {
          setAccounts(result);
        });
      }
    }

    initWeb3()
  }, [])    

  const handleCustomInput = (abi: ABIParameter) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInput((oldState) => ({
      ...oldState,
      [abi.name]: {
        type: abi.type,
        value: e.target.value
      }
    }))
  }

  const resetState = () => {
    setConstructorInput(null)
    setContract(null)
    setCustomInput({})
    setSalt('')
    setLoading(false)
  }

  const handleVariableParsing = () => {
    const encodedValues = Object.keys(customInput).map(key => {
      const param = customInput[key]
      const isArray = param.type.indexOf('[]') !== -1
      const params = isArray ? arrayify(param.value) : param.value
      
      if(param.type.indexOf('bytes') !== -1) {
        return {
          type: param.type,
          params: encodeBytes(params)
        }
      }

      return {
        type: param.type,
        params
      }
    })
    const types = encodedValues.map(({ type }) => type)
    const values = encodedValues.map(({ params }) => params)
    const encodedParams = window.web3.eth.abi.encodeParameters(types, values).substring(2)

    const ctr = contractToDeploy as CompiledContractJSON
    const toDeploy = ctr.data.bytecode.object + encodedParams

    const contract = new window.web3.eth.Contract(factoryContract.abi as AbiItem[], '0x56434E34E7771aa9680d09220Fe5d4D5c305323a');
    setLoading(true)
    contract.methods.deploy(`0x${toDeploy}`, salt)
      .send({ from: accounts[0] })
      .then(() => {
        contract.methods.getAddress(`0x${toDeploy}`, salt)
          .call()
          .then((res: string) => {
            resetState()
            setDeployedAddress(res)
          })
      })
      .catch((err: unknown) => console.log(err))
  }

  const canDeploy = () => {
    if(constructorInput) {
      const inputs = Object.keys(customInput).map(key => !!customInput[key].value)
      const allInputs = constructorInput.inputs?.length
      
      if(inputs.length === 0 || inputs.length !== allInputs) {
        return false
      }
      return inputs.every(Boolean)
    } 

    return !!salt
  }

  return (
    <div className="container">
      Select compiled contract JSON
      <div role="button" className="button" onClick={handleParsing}>load contract</div>
      {constructorInput ? (
        <>
          {constructorInput.inputs && constructorInput.inputs.map((input, idx) => {
            const inp = input as ABIParameter
            return (
              <div key={idx} className="input-row">
                <label htmlFor={`${idx}`}>{inp.name} {getHint(inp.internalType)}</label>
                <input id={`${idx}`} placeholder={inp.internalType} value={customInput[inp.name]?.value} onChange={handleCustomInput(inp)} />
              </div>
            )
          })}
        </>
      ) : null}

      {contractToDeploy ? (
        <>
          <label htmlFor="salt">Enter Salt</label>
          <input id="salt" placeholder="ex. 0x018716238712" value={salt} onChange={e => setSalt(e.target.value)} /> 
        </>
      ): null}

      {contractToDeploy && canDeploy() ? <div role="button" className="button" onClick={handleVariableParsing}>deploy</div> : null}
      {isLoading ? 'Deploy in progress...' : null}
      {depoyedAddress ? <>Deployed address: <div className="address">{depoyedAddress}</div></> : null}
    </div>  
  )
}

export default App
