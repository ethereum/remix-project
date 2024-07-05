import React, { useEffect } from 'react'
import { ethers } from 'ethers'

import { AppContext } from '../AppContext'
import { ContractDropdownSelection } from './ContractDropdown'

const abiCoder = new ethers.utils.AbiCoder()

interface ConstructorArgumentsProps {
  abiEncodedConstructorArgs: string
  setAbiEncodedConstructorArgs: React.Dispatch<React.SetStateAction<string>>
  selectedContract: ContractDropdownSelection
}

// TODO
// Add mapping VerifierIdentifier -> ConstructorArgsRequired
// Check enabledVerifiers: when not required, don't show component and set to null

export const ConstructorArguments: React.FC<ConstructorArgumentsProps> = ({ abiEncodedConstructorArgs, setAbiEncodedConstructorArgs, selectedContract }) => {
  const { compilationOutput } = React.useContext(AppContext)
  const [constructorArgsValues, setConstructorArgsValues] = React.useState<string[]>([])
  const [abiEncodingError, setAbiEncodingError] = React.useState<string | null>('')
  const [toggleRawInput, setToggleRawInput] = React.useState<boolean>(false)

  const { triggerFilePath, filePath, contractName } = selectedContract
  const selectedCompilerAbstract = triggerFilePath && compilationOutput[triggerFilePath]
  const compiledContract = selectedCompilerAbstract?.data?.contracts?.[filePath]?.[contractName]
  const abi = compiledContract?.abi

  // Wanted to use execution.txHelper.getConstructorInterface from @remix-project/remix-lib but getting errors: 'error getting eth provider options', 'global is not defined' etc.
  const constructorArgs = abi && abi.find((a) => a.type === 'constructor') && abi.find((a) => a.type === 'constructor').inputs

  useEffect(() => {
    if (!constructorArgs) {
      setConstructorArgsValues([])
      return
    }
    setConstructorArgsValues(Array(constructorArgs.length).fill(''))
  }, [constructorArgs])

  // Do the abi encoding when user values are input
  useEffect(() => {
    if (!constructorArgs) {
      setAbiEncodedConstructorArgs('')
      setAbiEncodingError('')
      return
    }
    if (constructorArgsValues.length !== constructorArgs.length) return
    // if any constructorArgsValue is falsey (empty etc.), don't encode yet
    if (constructorArgsValues.some((value) => !value)) return setAbiEncodingError('')

    const types = constructorArgs.map((inp) => inp.type)
    try {
      console.log('constructorArgsValues', constructorArgsValues)
      console.log('types', types)
      const newAbiEncoding = abiCoder.encode(types, constructorArgsValues)
      setAbiEncodedConstructorArgs(newAbiEncoding)
      setAbiEncodingError('')
    } catch (e) {
      console.error(e)
      setAbiEncodingError('Encoding error: ' + e.message)
    }
  }, [constructorArgsValues, constructorArgs])

  if (!selectedContract) return null
  if (!compilationOutput && Object.keys(compilationOutput).length === 0) return null
  // No render if no constructor args
  if (!constructorArgs || constructorArgs.length === 0) return null

  const handleRawConstructorArgs = (value: string) => {
    try {
      const decoded = abiCoder.decode(
        constructorArgs.map((inp) => inp.type),
        value
      )
      setConstructorArgsValues(decoded.map((val) => val.toString()))
    } catch (e) {
      console.error(e)
      setAbiEncodingError('Decoding error: ' + e.message)
    }
  }
  return (
    <div className="mt-4">
      <label>Constructor Arguments</label>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="toggleRawInputSwitch" checked={toggleRawInput} onChange={() => setToggleRawInput(!toggleRawInput)} />
        <label className="form-check-label" htmlFor="toggleRawInputSwitch">
          Enter Raw Abi Encoded Constructor Arguments
        </label>
      </div>
      {toggleRawInput ? (
        <div>
          {' '}
          <textarea className="form-control" rows={5} placeholder="0x00000000000000000000000000000000d41867734bbee4c6863d9255b2b06ac1..." value={abiEncodedConstructorArgs} onChange={(e) => handleRawConstructorArgs(e.target.value)} />
          {abiEncodingError && <div className="text-danger small">{abiEncodingError}</div>}
        </div>
      ) : (
        <div>
          {constructorArgs.map((inp, i) => (
            <div key={`constructor-arg-${inp.name}`} className="d-flex flex-row align-items-center mb-2">
              <div className="mr-2 small">{inp.name}</div>
              <input className="form-control" placeholder={inp.type} value={constructorArgsValues[i] || ''} onChange={(e) => setConstructorArgsValues([...constructorArgsValues.slice(0, i), e.target.value, ...constructorArgsValues.slice(i + 1)])} />
            </div>
          ))}
          {abiEncodedConstructorArgs && (
            <div>
              <label className="form-check-label" htmlFor="rawAbiEncodingResult">
                ABI Encoded contructor arguments:
              </label>
              <textarea className="form-control" rows={5} disabled value={abiEncodedConstructorArgs} id="rawAbiEncodingResult" style={{ opacity: 0.5 }} />
            </div>
          )}
          {abiEncodingError && <div className="text-danger small">{abiEncodingError}</div>}
        </div>
      )}
    </div>
  )
}
