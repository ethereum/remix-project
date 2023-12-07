import { CopyToClipboard } from '@remix-ui/clipboard'
import { CustomTooltip } from '@remix-ui/helper'
import JSONTree, { ThemeKeys } from 'react-json-view'
import React, { useState } from 'react'
// import { Tabs, Tab, Button } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from 'react-bootstrap/Button'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
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


export default function VyperCompile(props: VyperCompilationResult) {
  const intl = useIntl()
  // const downloadFn = () => {
  //   _paq.push(['trackEvent', 'compiler', 'compilerDetails', 'download'])
  //   saveAs(new Blob([JSON.stringify(contractProperties, null, '\t')]), `${selectedContract}_compData.json`)
  // }
  const [active, setActive] = useState<keyof VyperCompilationResult>('abi')

  const tabContent = [
    {
      tabHeadingText: 'ABI',
      tabPayload: props.abi, //Object.values(props)[0]['abi'],
      tabMemberType: 'abi',
      tabButtonText: () => 'Copy ABI',
      eventKey: 'abi'
    },
    {
      tabHeadingText: 'Bytecode',
      tabPayload: props.bytecode, //Object.values(props)[0]['bytecode'].object.toString(),
      tabMemberType: 'bytecode',
      tabButtonText: () => 'Copy Bytecode',
      eventKey: 'bytecode'
    },
    {
      tabHeadingText: 'Runtime Bytecode',
      tabPayload: props.bytecodeRuntime,// Object.values(props)[0]['runtimeBytecode'].object.toString(),
      tabMemberType: 'bytecode_runtime',
      tabButtonText: () => 'Copy Runtime Bytecode',
      eventKey: 'bytecode_runtime'
    }
    // {
    //   tabHeadingText: 'LLL',
    //   tabPayload: Object.values(contractProperties)[0]['ir'] ? '' : '',
    //   tabMemberType: 'ir',
    //   tabButtonText: () => Object.values(contractProperties)[0]['ir'] ? 'Copy LLL Code' : 'Nothing to copy yet',
    //   eventKey: 'ir'
    // }
  ]
  return (
    <>
      {/* <div className="d-flex justify-content-between align-items-center mr-1">
        <span className="lead">{selectedContract}</span>
        <CustomTooltip tooltipText={intl.formatMessage({id: 'solidity.compileDetails'})}>
          <span className="btn btn-outline-success border-success mr-1" onClick={downloadFn}>Download</span>
        </CustomTooltip>
      </div> */}
      <Tabs id="result" activeKey={active} onSelect={(key: any) => setActive(key)} justify>
        {tabContent.map((content, index) => (
          <Tab eventKey={content.eventKey} title={content.tabHeadingText} as={'span'} key={`${index}-${content.eventKey}`}>
            <CopyToClipboard getContent={() => content.eventKey !== 'abi' ? content.tabPayload : JSON.stringify(Object.values(props)[0]['abi'])}>
              <Button variant="info" className="copy" data-id={content.eventKey === 'abi' ? "copy-abi" : ''}>
                {content.tabButtonText()}
              </Button>
            </CopyToClipboard>
            {
              content.eventKey === 'abi' ? <JSONTree src={content.tabPayload as ABIDescription[]} theme={{} as any}/> : (
                <textarea defaultValue={content.tabPayload as string}></textarea>
              )
            }
            {/* <Button>
              {content.tabButtonText()}
            </Button> */}
          </Tab>))}
      </Tabs>
    </>
  )
}
