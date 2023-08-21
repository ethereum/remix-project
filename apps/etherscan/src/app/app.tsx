import React, {useState, useEffect, useRef} from 'react'

import {CompilationFileSources, CompilationResult} from '@remixproject/plugin-api'

import {RemixClient} from './RemixPlugin'
import {createClient} from '@remixproject/plugin-webview'

import {AppContext} from './AppContext'
import {DisplayRoutes} from './routes'

import {useLocalStorage} from './hooks/useLocalStorage'

import {getReceiptStatus, getEtherScanApi, getNetworkName, getProxyContractReceiptStatus} from './utils'
import {Receipt, ThemeType} from './types'

import './App.css'

export const getNewContractNames = (compilationResult: CompilationResult) => {
  const compiledContracts = compilationResult.contracts
  let result: string[] = []

  for (const file of Object.keys(compiledContracts)) {
    const newContractNames = Object.keys(compiledContracts[file])
    result = [...result, ...newContractNames]
  }

  return result
}

const App = () => {
  const [apiKey, setAPIKey] = useLocalStorage('apiKey', '')
  const [clientInstance, setClientInstance] = useState(undefined as any)
  const [receipts, setReceipts] = useLocalStorage('receipts', [])
  const [contracts, setContracts] = useState([] as string[])
  const [themeType, setThemeType] = useState('dark' as ThemeType)
  const timer = useRef(null)

  const clientInstanceRef = useRef(clientInstance)
  clientInstanceRef.current = clientInstance
  const contractsRef = useRef(contracts)
  contractsRef.current = contracts

  useEffect(() => {
    const client = new RemixClient()
    createClient(client)
    const loadClient = async () => {
      await client.onload()
      setClientInstance(client)
      client.on('solidity', 'compilationFinished', (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => {
        const newContractsNames = getNewContractNames(data)

        const newContractsToSave: string[] = [...contractsRef.current, ...newContractsNames]

        const uniqueContracts: string[] = [...new Set(newContractsToSave)]

        setContracts(uniqueContracts)
      })

      //const currentTheme = await client.call("theme", "currentTheme")
      //setThemeType(currentTheme.quality)
      //client.on("theme", "themeChanged", (theme) => {
      //  setThemeType(theme.quality)
      //})
    }

    loadClient()
  }, [])

  useEffect(() => {
    let receiptsNotVerified: Receipt[] = receipts.filter((item: Receipt) => {
      return item.status === 'Pending in queue' || item.status === 'Max rate limit reached'
    })

    if (receiptsNotVerified.length > 0) {
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }
      timer.current = setInterval(async () => {
        const {network, networkId} = await getNetworkName(clientInstanceRef.current)
        if (!clientInstanceRef.current) {
          return
        }

        if (network === 'vm') {
          return
        }
        let newReceipts = receipts
        for (const item of receiptsNotVerified) {
          await new Promise((r) => setTimeout(r, 500)) // avoid api rate limit exceed.
          let status
          if (item.isProxyContract) {
            status = await getProxyContractReceiptStatus(item.guid, apiKey, getEtherScanApi(networkId))
            if (status.status === '1') {
              status.message = status.result
              status.result = 'Successfully Updated'
            }
          } else status = await getReceiptStatus(item.guid, apiKey, getEtherScanApi(networkId))
          if (status.result === 'Pass - Verified' || status.result === 'Already Verified' || status.result === 'Successfully Updated') {
            newReceipts = newReceipts.map((currentReceipt: Receipt) => {
              if (currentReceipt.guid === item.guid) {
                const res = {
                  ...currentReceipt,
                  status: status.result
                }
                if (currentReceipt.isProxyContract) res.message = status.message
                return res
              }
              return currentReceipt
            })
          }
        }
        receiptsNotVerified = newReceipts.filter((item: Receipt) => {
          return item.status === 'Pending in queue' || item.status === 'Max rate limit reached'
        })
        if (timer.current && receiptsNotVerified.length === 0) {
          clearInterval(timer.current)
          timer.current = null
        }
        setReceipts(newReceipts)
      }, 10000)
    }
  }, [receipts])

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setAPIKey,
        clientInstance,
        receipts,
        setReceipts,
        contracts,
        setContracts,
        themeType,
        setThemeType
      }}
    >
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
