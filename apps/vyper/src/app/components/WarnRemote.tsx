import React from 'react'

interface Props {
  environment: 'remote' | 'local'
}

function WarnRemoteLabel({ environment }: Props) {

  if (environment === 'local') {
    return <></>
  }

  return (
    <small className="mx-4 text-warning pb-4">The remote compiler should only be used for testing NOT for production environments. For production, use a local compiler.</small>
  )
}

export default WarnRemoteLabel;