import {CopyToClipboard} from '@remix-ui/clipboard'
import Reaact from 'react'
import { RemixClient } from '../utils'
import { VyperCompilationError} from '../utils/types'

export function CompileErrorCard(props: { output: VyperCompilationError, plugin: RemixClient }) {
  return (
    <div
      id="vyperErrorResult"
      className=" d-flex flex-column p-2 alert alert-danger error vyper-compile-error vyper-panel-width"
    >
      <span
        data-id="error-message"
        className="text-start"
        style={{
          overflowX: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {props.output.message.trim()}
      </span>
      <div className="d-flex flex-column pt-3 align-items-end mb-2">
        <div>
          <span className="border border-ai text-ai btn-sm" onClick={async () => await props.plugin.askGpt(props.output.message)}>
            Ask RemixAI
          </span>
          <span className="ms-3 pt-1 py-1">
            <CopyToClipboard content={props.output.message} className={`p-0 m-0 far fa-copy alert alert-danger border-0`} direction={'top'} />
          </span>
        </div>
      </div>
    </div>
  )
}
