
import { CopyToClipboard } from '@remix-ui/clipboard'
import React, { useEffect, useState } from 'react'

export default function CopyIcon({ selectedAccount, intl}) {

  useEffect(() => {
  }, [selectedAccount])

  return (
    <div style={{marginLeft: -5}}>
      <CopyToClipboard tip={intl.formatMessage({id: 'udapp.copyAccount'})} content={selectedAccount} direction="top" />
    </div>
  )
}
declare global {
  interface Window {
    ethereum: import('ethers').providers.ExternalProvider & any
  }
}
