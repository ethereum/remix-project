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

type TabContentMembers = {
  tabText: string
  tabPayload: any
  tabMemberType: 'abi' | 'bytecode' | 'bytecode_runtime' | 'ir'
  className: string
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

  const tabContent = [
    {
      tabHeadingText: 'ABI',
      tabPayload: Object.values(output)[0]['abi'],
      tabMemberType: 'abi',
      tabButtonText: () => 'Copy ABI',
      eventKey: 'abi'
    },
    {
      tabHeadingText: 'Bytecode',
      tabPayload: Object.values(output)[0]['bytecode'].object.toString(),
      tabMemberType: 'bytecode',
      tabButtonText: () => 'Copy Bytecode',
      eventKey: 'bytecode'
    },
    {
      tabHeadingText: 'Runtime Bytecode',
      tabPayload: Object.values(output)[0]['runtimeBytecode'].object.toString(),
      tabMemberType: 'bytecode_runtime',
      tabButtonText: () => 'Copy Runtime Bytecode',
      eventKey: 'bytecode_runtime'
    },
    {
      tabHeadingText: 'LLL',
      tabPayload: Object.values(output)[0]['ir'] ? '' : '',
      tabMemberType: 'ir',
      tabButtonText: () => Object.values(output)[0]['ir'] ? 'Copy LLL Code' : 'Nothing to copy yet',
      eventKey: 'ir'
    }
  ]

  return (
    <Tabs id="result" activeKey={active} onSelect={(key: any) => setActive(key)} justify>
      {tabContent.map((content, index) => (
        <Tab eventKey={content.eventKey} title={content.tabHeadingText} as={'span'} key={`${index}-${content.eventKey}`}>
          <CopyToClipboard getContent={() => content.eventKey !== 'abi' ? content.tabPayload : JSON.stringify(Object.values(output)[0]['abi'])}>
            <Button variant="info" className="copy" data-id={content.eventKey === 'abi' ? "copy-abi" : ''}>
              {content.tabButtonText()}
            </Button>
          </CopyToClipboard>
          {
            content.eventKey === 'abi' ? <JSONTree src={content.tabPayload} theme={themeColor as any}/> : (
              <textarea defaultValue={content.tabPayload}></textarea>
            )
          }
        </Tab>))
      }
    </Tabs>
  )
}

export default VyperResult
