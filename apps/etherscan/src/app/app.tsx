import React, { useState, useEffect, useRef } from "react"

import {
  CompilationFileSources,
  CompilationResult,
} from "@remixproject/plugin-api"

import { RemixClient } from "./RemixPlugin";
import { createClient } from "@remixproject/plugin-webview";

import { AppContext } from "./AppContext"
import { DisplayRoutes } from "./routes"

import { useLocalStorage } from "./hooks/useLocalStorage"

import { getReceiptStatus, getEtherScanApi, getNetworkName } from "./utils"
import { Receipt, ThemeType } from "./types"

import "./App.css"

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
  const [apiKey, setAPIKey] = useLocalStorage("apiKey", "")
  const [clientInstance, setClientInstance] = useState(undefined as any)
  const [receipts, setReceipts] = useLocalStorage("receipts", [])
  const [contracts, setContracts] = useState([] as string[])
  const [themeType, setThemeType] = useState("dark" as ThemeType)

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
      client.on("solidity",
        "compilationFinished",
        (
          fileName: string,
          source: CompilationFileSources,
          languageVersion: string,
          data: CompilationResult
        ) => {
          const newContractsNames = getNewContractNames(data)

          const newContractsToSave: string[] = [
            ...contractsRef.current,
            ...newContractsNames,
          ]

          const uniqueContracts: string[] = [...new Set(newContractsToSave)]

          setContracts(uniqueContracts)
        }
      )

      //const currentTheme = await client.call("theme", "currentTheme")
      //setThemeType(currentTheme.quality)
      //client.on("theme", "themeChanged", (theme) => {
      //  setThemeType(theme.quality)
      //})
    }

    loadClient()
  }, [])

  useEffect(() => {
    if (!clientInstance) {
      return
    }

    const receiptsNotVerified: Receipt[] = receipts.filter((item: Receipt) => {
      return item.status === "Pending in queue"
    })

    if (receiptsNotVerified.length > 0) {
      const timer1 = setInterval(() => {
        receiptsNotVerified.forEach(async (item) => {
          if (!clientInstanceRef.current) {
            return {}
          }
          const network = await getNetworkName(clientInstanceRef.current)
          if (network === "vm") {
            return {}
          }
          const status = await getReceiptStatus(
            item.guid,
            apiKey,
            getEtherScanApi(network)
          )
          if (status.result === "Pass - Verified" || status.result === "Already Verified") {
            const newReceipts = receipts.map((currentReceipt: Receipt) => {
              if (currentReceipt.guid === item.guid) {
                return {
                  ...currentReceipt,
                  status: status.result,
                }
              }
              return currentReceipt
            })

            clearInterval(timer1)
            setReceipts(newReceipts)

            return () => {
              clearInterval(timer1)
            }
          }
          return {}
        })
      }, 5000)
    }
  }, [receipts, clientInstance, apiKey, setReceipts])

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
        setThemeType,
      }}
    >
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
