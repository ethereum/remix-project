import React from 'react'

interface Props {
  environment: 'remote' | 'local'
}

function WarnRemoteLabel({ environment }: Props) {

  if (environment === 'local') {
    return <></>
  }

  return (
    <div className="alert alert-warning">The remote compiler should only be used for testing NOT for production environments. For production, use a local compiler.</div>
  )
}

export default WarnRemoteLabel;