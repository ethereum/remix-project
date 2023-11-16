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
  themeColor?: string
}

export type ExampleContract = {
  name: string
  address: string
}

function VyperResult({ output, themeColor }: VyperResultProps) {
  const [active, setActive] = useState<keyof VyperCompilationResult>('abi')

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
    <Tabs id="result" activeKey={active} onSelect={(key: any) => setActive(key)} justify>
      <Tab eventKey="abi" title="ABI" as={'span'}>
        <CopyToClipboard getContent={() => JSON.stringify(Object.values(output)[0]['abi'])}>
          <Button variant="info" className="copy" data-id="copy-abi">
            Copy ABI
          </Button>
        </CopyToClipboard>
        <JSONTree src={Object.values(output)[0]['abi']} theme={themeColor as any}/>
      </Tab>
      <Tab eventKey="bytecode" title="Bytecode">
        <CopyToClipboard getContent={() => JSON.stringify(Object.values(output)[0]['bytecode'].object.toString())}>
          <Button variant="info" className="copy">
            Copy Bytecode
          </Button>
        </CopyToClipboard>
        <textarea defaultValue={Object.values(output)[0]['bytecode'].object.toString()}></textarea>
      </Tab>
      <Tab eventKey="bytecode_runtime" title="Runtime Bytecode">
        <CopyToClipboard getContent={() => JSON.stringify(Object.values(output)[0]['runtimeBytecode'].object.toString())}>
          <Button variant="info" className="copy">
            Copy Runtime Bytecode
          </Button>
        </CopyToClipboard>
        <textarea defaultValue={Object.values(output)[0]['runtimeBytecode'].object.toString()}></textarea>
      </Tab>
      <Tab eventKey="ir" title="LLL">
        <CopyToClipboard getContent={() => JSON.stringify(Object.values(output)[0]['ir'])}>
          <Button disabled={Object.values(output)[0]['ir'].length <= 1} variant="info" className="copy">
            {Object.values(output)[0]['ir'].length > 1 ? 'Copy LLL Code' : 'Nothing to copy yet'}
          </Button>
        </CopyToClipboard>
        <textarea defaultValue={Object.values(output)[0]['ir'].toString()}></textarea>
      </Tab>
    </Tabs>
  )
}

export default VyperResult
