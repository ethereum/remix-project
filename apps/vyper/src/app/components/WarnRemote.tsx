import React from 'react'

interface Props {
  environment: 'remote' | 'local'
}

function WarnRemoteLabel({environment}: Props) {
  if (environment === 'local') {
    return <></>
  }

  return (
    <small className="mx-4 text-warning pb-4"></small>
  )
}

export default WarnRemoteLabel
