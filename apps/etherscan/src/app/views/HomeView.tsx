import React from "react"
import { Navigate } from "react-router-dom"
import { AppContext } from "../AppContext"
import { Receipt } from "../types"
import { VerifyView } from "./VerifyView"

export const HomeView: React.FC = () => {
  return (
    <AppContext.Consumer>
      {async ({ apiKey, clientInstance, setReceipts, receipts, contracts }) => {
        if (!apiKey && clientInstance && clientInstance.call) {
          const current: string= await clientInstance.call('sidePanel', 'currentFocus')

          if (current === 'etherscan') await clientInstance.call('notification', 'toast', 'Please add API key to continue')
        }
        return !apiKey ? (
          <Navigate
            to={{
              pathname: "/settings"
            }}
          />
        ) : (
          <VerifyView
            contracts={contracts}
            client={clientInstance}
            apiKey={apiKey}
            onVerifiedContract={(receipt: Receipt) => {
              const newReceipts = [...receipts, receipt]
              setReceipts(newReceipts)
            }}
          />
        )
      }
    }
    </AppContext.Consumer>
  )
}
