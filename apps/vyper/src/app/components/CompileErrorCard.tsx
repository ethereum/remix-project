import Reaact from 'react'

export function CompileErrorCard(props: any) {
  return (
    <div id="vyperErrorResult" className="px-2 mx-3 alert alert-danger error" title={props.output.message}>
      <i className="fas fa-exclamation-circle text-danger"></i>
      <span
        data-id="error-message"
        className="text-center"
        style={{
          overflowX: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {props.output.message.trim()}
      </span>
    </div>
  )
}
