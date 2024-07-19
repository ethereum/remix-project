import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers/'

interface ConfigInputProps {
  label: string
  id: string
  secret: boolean
  initialValue: string
  saveResult: (result: string) => void
}

// Chooses one contract from the compilation output.
export const ConfigInput: React.FC<ConfigInputProps> = ({ label, id, secret, initialValue, saveResult }) => {
  const [value, setValue] = useState(initialValue)
  const [enabled, setEnabled] = useState(false)

  // Reset state when initialValue changes
  useEffect(() => {
    setValue(initialValue)
    setEnabled(false)
  }, [initialValue])

  const handleChange = () => {
    setEnabled(true)
  }

  const handleSave = () => {
    setEnabled(false)
    saveResult(value)
  }

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input type={secret ? 'password' : 'text'} className="form-control mb-2" id={id} placeholder={`Add ${label}`} value={value} onChange={(e) => setValue(e.target.value)} disabled={!enabled} />
      <div className="d-flex flex-row justify-content-start">
        <button type="button" className="btn btn-secondary mr-3" disabled={enabled} onClick={handleChange}>
          Change
        </button>
        <button type="button" className="btn btn-secondary" disabled={!enabled} onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  )
}
