import React, {useState} from 'react'
import {VyperCompilationOutput, isCompilationError} from '../utils'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from 'react-bootstrap/Button'
import JSONTree, { ThemeKeys } from 'react-json-view'
import ReactJson from 'react-json-view'
import {CopyToClipboard} from '@remix-ui/clipboard'
import { VyperCompilationResult } from '../utils/types'

interface VyperResultProps {
  output?: any
}

export type ExampleContract = {
  name: string
  address: string
}

type TabContentMembers = {
  tabText: string
  tabPayload: any
  tabMemberType: 'abi' | 'bytecode' | 'bytecode_runtime' | 'ir'
  className: string
}

function VyperResult({ output }: VyperResultProps) {
  // const [active, setActive] = useState<keyof VyperCompilationResult>('abi')

  if (!output)
    return (
      <div id="result">
        <p className="my-3">No contract compiled yet.</p>
      </div>
    )

  if (isCompilationError(output)) {
    return (
      <div id="result" className="error" title={output.message}>
        <i className="fas fa-exclamation-circle text-danger"></i>
        <pre
          data-id="error-message"
          className="px-2 w-100 alert alert-danger"
          style={{
            fontSize: '0.5rem',
            overflowX: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {output.message}
        </pre>
      </div>
    )
  }

  return (
    <>
      <div className="border border-top"></div>
      <div>
        <button className="btn btn-secondary btn-block mx-2" onClick={() => {

        }}>
          <span>Compilation Details</span>
        </button>
      </div>
    </>
  )
}

export default VyperResult
