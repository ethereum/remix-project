import { CopyToClipboard } from '@remix-ui/clipboard'
import JSONTree, { ThemeKeys, ThemeObject } from '@microlink/react-json-view'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from 'react-bootstrap/Button'
import { ABIDescription } from '@remixproject/plugin-api'
const _paq = (window._paq = window._paq || [])

export interface VyperCompilationResult {
  status?: 'success'
  bytecode: string
  bytecodeRuntime: string
  abi: ABIDescription[]
  ir: string
  methodIdentifiers: {
    [method: string]: string
  }
}

export interface VyperCompileProps {
  result: VyperCompilationResult
  theme?: ThemeKeys | ThemeObject
  themeStyle?: any
}


export default function VyperCompile({result, theme, themeStyle}: VyperCompileProps) {
  const intl = useIntl()

  const [active, setActive] = useState<keyof VyperCompilationResult>('abi')
  console.log(theme, themeStyle)
  const tabContent = [
    {
      tabHeadingText: 'ABI',
      tabPayload: result.abi,
      tabMemberType: 'abi',
      tabButtonText: () => 'Copy ABI',
      eventKey: 'abi'
    },
    {
      tabHeadingText: 'Bytecode',
      tabPayload: result.bytecode,
      tabMemberType: 'bytecode',
      tabButtonText: () => 'Copy Bytecode',
      eventKey: 'bytecode'
    },
    {
      tabHeadingText: 'Runtime Bytecode',
      tabPayload: result.bytecodeRuntime,
      tabMemberType: 'bytecode_runtime',
      tabButtonText: () => 'Copy Runtime Bytecode',
      eventKey: 'bytecode_runtime'
    }
  ]
  return (
    <>
      <Tabs id="result" activeKey={active} onSelect={(key: any) => setActive(key)} justify>
        {tabContent.map((content, index) => (
          <Tab eventKey={content.eventKey} title={content.tabHeadingText} as={'span'} key={`${index}-${content.eventKey}`}>
            <div className="d-flex flex-column w-75 justify-content-center mx-auto rounded-2">
              <CopyToClipboard getContent={() => (content.eventKey !== 'abi' ? content.tabPayload : JSON.stringify(Object.values(result)[0]['abi']))}>
                <Button variant="info" className="copy mt-3 ml-2" data-id={content.eventKey === 'abi' ? 'copy-abi' : ''}>
                  <span className="far fa-copy mr-2"></span>
                  {content.tabButtonText()}
                </Button>
              </CopyToClipboard>
              {content.eventKey === 'abi' ? (
                <div className="my-3">
                  <JSONTree
                    src={content.tabPayload as ABIDescription[]}
                    theme={theme}
                    style={themeStyle}
                  />
                </div>
              ) : (
                <div className="w-100 mt-2 p-2 mx-auto">
                  <textarea className="form-control rounded-2" defaultValue={content.tabPayload as string} rows={15}></textarea>
                </div>
              )}
            </div>
          </Tab>
        ))}
      </Tabs>
    </>
  )
}
