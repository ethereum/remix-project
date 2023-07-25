import React from "react"
import { PluginClient } from "@remixproject/plugin"

import { Receipt, ThemeType } from "./types"

export interface AppContextProps {
  apiKey: string
  setAPIKey: (value: string) => void
  clientInstance: typeof PluginClient & PluginClient
  receipts: Receipt[]
  setReceipts: (receipts: Receipt[]) => void
  contracts: string[]
  setContracts: (contracts: string[]) => void
  themeType: ThemeType
  setThemeType: (themeType: ThemeType) => void
}


export const AppContext = React.createContext({
  apiKey: "",
  setAPIKey: (value: string) => {
    console.log("Set API Key from Context")
  },
  clientInstance: {},
  receipts: [] as Receipt[],
  setReceipts: (receipts: Receipt[]) => {
    console.log("Calling Set Receipts")
  },
  contracts: [] as string[],
  setContracts: (contracts: string[]) => {
    console.log("Calling Set Contract Names")
  },
  themeType: "dark" as ThemeType,
  setThemeType: (themeType: ThemeType) => {
    console.log("Calling Set Theme Type")
  },
} as AppContextProps)
