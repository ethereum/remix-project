import React from 'react'

import {Navigate} from 'react-router-dom'

import {AppContext} from '../AppContext'
import {Receipt} from '../types'

import {VerifyView} from './VerifyView'

export const HomeView = () => {
  const context = React.useContext(AppContext)
  
  return !context.apiKey ? (
    <Navigate
      to={{
        pathname: '/settings'
      }}
    />
  ) : (
    <VerifyView
      contracts={context.contracts}
      client={context.clientInstance}
      apiKey={context.apiKey}
      onVerifiedContract={(receipt: Receipt) => {
        const newReceipts = [...context.receipts, receipt]
        context.setReceipts(newReceipts)
      }}
      networkName={context.networkName}
    />
  )
}
