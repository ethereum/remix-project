import React from 'react'

interface Props {
  environment: 'remote' | 'local'
}

function WarnRemoteLabel({environment}: Props) {
  if (environment === 'local') {
    return <></>
  }

  return (
    <small className="mx-4 text-warning pb-4">Do not use the remote compiler in a production environment, it is only for testing purposes. For production, use a local compiler.</small>
  )
}

export default WarnRemoteLabel
