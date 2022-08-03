import React from 'react'

interface Props {
  environment: 'remote' | 'local'
}

function WarnRemoteLabel({ environment }: Props) {

  if (environment === 'local') {
    return <></>
  }

  return (
    <div className="alert alert-warning">It is really important to not use the remote compiler for production environment.
        Please only use it for testing purpose and prefer to using a local compiler for production like environment.</div>
  )
}

export default WarnRemoteLabel;